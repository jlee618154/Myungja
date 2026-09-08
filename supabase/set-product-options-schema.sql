-- SET 상품의 상의/하의 옵션(색상+사이즈)을 완전히 독립적으로 선택할 수 있도록 지원.
-- SET 상품이 실제로 어떤 두 원상품(상의/하의)을 묶은 것인지 연결하고,
-- 장바구니/주문에 상의·하의 색상/사이즈를 각각 저장하며,
-- 재고는 SET 상품 자체가 아니라 실제 원상품(top_product_id/bottom_product_id)의 product_options에서 검증/차감한다.
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

begin;

-- 1) SET 상품 -> 실제 상의/하의 원상품 연결
alter table products add column if not exists top_product_id uuid references products(id);
alter table products add column if not exists bottom_product_id uuid references products(id);

update products set
  top_product_id = (select id from products where slug = 'signature-airfit-bra'),
  bottom_product_id = (select id from products where slug = 'soft-jersey-leggings')
where slug = 'signature-airfit-legging-set';

update products set
  top_product_id = (select id from products where slug = 'airy-knit-bra-top'),
  bottom_product_id = (select id from products where slug = 'soft-jersey-leggings')
where slug = 'airy-knit-legging-set';

update products set
  top_product_id = (select id from products where slug = 'cool-touch-sleeveless'),
  bottom_product_id = (select id from products where slug = 'soft-jersey-leggings')
where slug = 'cool-touch-legging-set';

update products set
  top_product_id = (select id from products where slug = 'daily-round-tee'),
  bottom_product_id = (select id from products where slug = 'soft-jersey-leggings')
where slug = 'daily-tee-legging-set';

update products set
  top_product_id = (select id from products where slug = 'soft-jersey-cap-sleeve-tee'),
  bottom_product_id = (select id from products where slug = 'soft-jersey-leggings')
where slug = 'cap-sleeve-legging-set';

-- 2) 장바구니/주문 아이템에 상의/하의 색상·사이즈 개별 저장 컬럼 추가
alter table cart_items add column if not exists top_color_name text;
alter table cart_items add column if not exists top_size product_size;
alter table cart_items add column if not exists bottom_color_name text;
alter table cart_items add column if not exists bottom_size product_size;

alter table order_items add column if not exists top_color_name text;
alter table order_items add column if not exists top_size product_size;
alter table order_items add column if not exists bottom_color_name text;
alter table order_items add column if not exists bottom_size product_size;

-- 3) 게스트 주문 생성: SET 상품이면 top_color_name/top_size/bottom_color_name/bottom_size를
--    받아 실제 원상품(top_product_id/bottom_product_id)의 재고를 검증한다.
create or replace function create_guest_order(
  p_items jsonb,
  p_guest_name text,
  p_guest_phone text,
  p_guest_email text,
  p_recipient_name text,
  p_recipient_phone text,
  p_zonecode text,
  p_address1 text,
  p_address2 text,
  p_delivery_request text,
  p_payment_method text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product record;
  v_stock_qty int;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_order_id uuid;
  v_order_no text;
  v_payment_id text;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ITEMS';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select id, price, top_product_id, bottom_product_id into v_product from products
      where id = (v_item->>'product_id')::uuid and is_active = true;
    if v_product.id is null then
      raise exception 'INVALID_PRODUCT';
    end if;

    if v_product.top_product_id is not null and v_product.bottom_product_id is not null then
      if (v_item->>'top_color_name') is null or (v_item->>'top_size') is null
         or (v_item->>'bottom_color_name') is null or (v_item->>'bottom_size') is null then
        raise exception 'MISSING_SET_OPTIONS';
      end if;

      select stock_qty into v_stock_qty from product_options
        where product_id = v_product.top_product_id
          and color_name = v_item->>'top_color_name'
          and size = (v_item->>'top_size')::product_size;
      if v_stock_qty is null or v_stock_qty < (v_item->>'qty')::int then
        raise exception 'OUT_OF_STOCK';
      end if;

      select stock_qty into v_stock_qty from product_options
        where product_id = v_product.bottom_product_id
          and color_name = v_item->>'bottom_color_name'
          and size = (v_item->>'bottom_size')::product_size;
      if v_stock_qty is null or v_stock_qty < (v_item->>'qty')::int then
        raise exception 'OUT_OF_STOCK';
      end if;
    else
      select stock_qty into v_stock_qty from product_options
        where product_id = v_product.id
          and color_name = v_item->>'color_name'
          and size = (v_item->>'size')::product_size;
      if v_stock_qty is null or v_stock_qty < (v_item->>'qty')::int then
        raise exception 'OUT_OF_STOCK';
      end if;
    end if;

    v_subtotal := v_subtotal + v_product.price * (v_item->>'qty')::int;
  end loop;

  v_shipping := case when v_subtotal > 0 and v_subtotal < 30000 then 3000 else 0 end;
  v_total := v_subtotal + v_shipping;

  v_order_no := 'G' || to_char(now(), 'YYYYMMDD') || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_payment_id := 'guest_' || replace(gen_random_uuid()::text, '-', '');

  insert into orders (
    order_no, status, user_id, is_guest, guest_name, guest_phone, guest_email,
    orderer_name, orderer_phone,
    recipient_name, recipient_phone, zonecode, address1, address2, delivery_request,
    subtotal, shipping_fee, coupon_discount, points_used, total_amount,
    payment_method, payment_id
  ) values (
    v_order_no, '결제대기', null, true, p_guest_name, p_guest_phone, p_guest_email,
    p_guest_name, p_guest_phone,
    p_recipient_name, p_recipient_phone, p_zonecode, p_address1, p_address2, p_delivery_request,
    v_subtotal, v_shipping, 0, 0, v_total,
    p_payment_method, v_payment_id
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select price, name, top_product_id, bottom_product_id into v_product
      from products where id = (v_item->>'product_id')::uuid;

    if v_product.top_product_id is not null and v_product.bottom_product_id is not null then
      insert into order_items (
        order_id, product_id, product_name, color_name, size, qty, unit_price,
        top_color_name, top_size, bottom_color_name, bottom_size
      )
      values (
        v_order_id, (v_item->>'product_id')::uuid, v_product.name,
        '상의 ' || (v_item->>'top_color_name') || ' ' || (v_item->>'top_size')
          || ' · 하의 ' || (v_item->>'bottom_color_name') || ' ' || (v_item->>'bottom_size'),
        (v_item->>'top_size')::product_size,
        (v_item->>'qty')::int, v_product.price,
        v_item->>'top_color_name', (v_item->>'top_size')::product_size,
        v_item->>'bottom_color_name', (v_item->>'bottom_size')::product_size
      );
    else
      insert into order_items (order_id, product_id, product_name, color_name, size, qty, unit_price)
      values (
        v_order_id, (v_item->>'product_id')::uuid, v_product.name,
        v_item->>'color_name', (v_item->>'size')::product_size,
        (v_item->>'qty')::int, v_product.price
      );
    end if;
  end loop;

  return jsonb_build_object('order_no', v_order_no, 'payment_id', v_payment_id, 'total_amount', v_total);
end;
$$;

-- 4) 결제 확정 시 재고 차감: SET 상품이면 실제 상의/하의 원상품의 product_options에서 차감.
create or replace function finalize_guest_order(p_order_no text, p_success boolean, p_paid_amount numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
  v_updated int;
  v_product record;
begin
  select * into v_order from orders where order_no = p_order_no and is_guest = true for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if v_order.status <> '결제대기' then
    return jsonb_build_object('ok', v_order.status = '결제완료', 'reason', 'ALREADY_PROCESSED', 'status', v_order.status);
  end if;

  if not p_success or p_paid_amount is distinct from v_order.total_amount then
    update orders set status = '취소' where id = v_order.id;
    return jsonb_build_object(
      'ok', false,
      'reason', case when not p_success then 'PAYMENT_FAILED' else 'AMOUNT_MISMATCH' end
    );
  end if;

  for v_item in select * from order_items where order_id = v_order.id
  loop
    if v_item.top_color_name is not null then
      select top_product_id, bottom_product_id into v_product from products where id = v_item.product_id;

      update product_options
        set stock_qty = stock_qty - v_item.qty
        where product_id = v_product.top_product_id
          and color_name = v_item.top_color_name
          and size = v_item.top_size
          and stock_qty >= v_item.qty;
      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        update orders set status = '취소' where id = v_order.id;
        return jsonb_build_object('ok', false, 'reason', 'OUT_OF_STOCK_AT_PAYMENT');
      end if;

      update product_options
        set stock_qty = stock_qty - v_item.qty
        where product_id = v_product.bottom_product_id
          and color_name = v_item.bottom_color_name
          and size = v_item.bottom_size
          and stock_qty >= v_item.qty;
      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        update orders set status = '취소' where id = v_order.id;
        return jsonb_build_object('ok', false, 'reason', 'OUT_OF_STOCK_AT_PAYMENT');
      end if;
    else
      update product_options
        set stock_qty = stock_qty - v_item.qty
        where product_id = v_item.product_id
          and color_name = v_item.color_name
          and size = v_item.size
          and stock_qty >= v_item.qty;
      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        update orders set status = '취소' where id = v_order.id;
        return jsonb_build_object('ok', false, 'reason', 'OUT_OF_STOCK_AT_PAYMENT');
      end if;
    end if;
  end loop;

  update orders set status = '결제완료' where id = v_order.id;
  return jsonb_build_object('ok', true);
end;
$$;

commit;
