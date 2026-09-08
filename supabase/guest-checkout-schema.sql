-- 비회원(게스트) 카카오페이/네이버페이 결제 지원을 위한 스키마 변경
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

begin;

-- 1) orders 테이블: 비회원 주문을 위해 user_id를 nullable로 변경하고 게스트 정보 컬럼 추가
alter table orders alter column user_id drop not null;
alter table orders add column if not exists is_guest boolean not null default false;
alter table orders add column if not exists guest_name text;
alter table orders add column if not exists guest_phone text;
alter table orders add column if not exists guest_email text;
alter table orders add column if not exists payment_id text;

create unique index if not exists orders_payment_id_key on orders (payment_id) where payment_id is not null;

-- 2) RLS: 비회원(anon)이 자신이 생성한 게스트 주문만 조회 가능 (주문 생성/상태 변경은 아래 SECURITY DEFINER 함수로만 가능)
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists guest_read_own_orders on orders;
create policy guest_read_own_orders
  on orders for select
  to anon, authenticated
  using (is_guest = true);

drop policy if exists guest_read_own_order_items on order_items;
create policy guest_read_own_order_items
  on order_items for select
  to anon, authenticated
  using (exists (select 1 from orders o where o.id = order_items.order_id and o.is_guest = true));

-- 3) 주문 생성: 클라이언트가 임의로 total_amount를 조작할 수 없도록, 가격/재고를 서버(DB)에서 재계산하는
--    SECURITY DEFINER 함수를 통해서만 게스트 주문을 만들 수 있게 한다. (anon에 직접 INSERT 권한을 주지 않음)
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
    select id, price into v_product from products
      where id = (v_item->>'product_id')::uuid and is_active = true;
    if v_product.id is null then
      raise exception 'INVALID_PRODUCT';
    end if;

    select stock_qty into v_stock_qty from product_options
      where product_id = v_product.id
        and color_name = v_item->>'color_name'
        and size = (v_item->>'size')::product_size;
    if v_stock_qty is null or v_stock_qty < (v_item->>'qty')::int then
      raise exception 'OUT_OF_STOCK';
    end if;

    v_subtotal := v_subtotal + v_product.price * (v_item->>'qty')::int;
  end loop;

  v_shipping := case when v_subtotal > 0 and v_subtotal < 30000 then 3000 else 0 end;
  v_total := v_subtotal + v_shipping;

  v_order_no := 'G' || to_char(now(), 'YYYYMMDD') || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_payment_id := 'guest_' || replace(gen_random_uuid()::text, '-', '');

  insert into orders (
    order_no, status, user_id, is_guest, guest_name, guest_phone, guest_email,
    recipient_name, recipient_phone, zonecode, address1, address2, delivery_request,
    subtotal, shipping_fee, coupon_discount, points_used, total_amount,
    payment_method, payment_id
  ) values (
    v_order_no, '결제대기', null, true, p_guest_name, p_guest_phone, p_guest_email,
    p_recipient_name, p_recipient_phone, p_zonecode, p_address1, p_address2, p_delivery_request,
    v_subtotal, v_shipping, 0, 0, v_total,
    p_payment_method, v_payment_id
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select price, name into v_product from products where id = (v_item->>'product_id')::uuid;
    insert into order_items (order_id, product_id, product_name, color_name, size, qty, unit_price)
    values (
      v_order_id, (v_item->>'product_id')::uuid, v_product.name,
      v_item->>'color_name', (v_item->>'size')::product_size,
      (v_item->>'qty')::int, v_product.price
    );
  end loop;

  return jsonb_build_object('order_no', v_order_no, 'payment_id', v_payment_id, 'total_amount', v_total);
end;
$$;

revoke all on function create_guest_order(jsonb, text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function create_guest_order(jsonb, text, text, text, text, text, text, text, text, text, text) to anon;

-- 4) 결제 취소/이탈 처리: 결제창을 닫거나 실패한 경우, 재고를 묶어두지 않도록 대기중 주문을 취소 처리
--    payment_id를 알아야만 취소 가능(자신이 방금 만든 주문만 취소 가능하도록 하는 최소한의 안전장치)
create or replace function cancel_pending_guest_order(p_order_no text, p_payment_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
    set status = '취소'
    where order_no = p_order_no
      and payment_id = p_payment_id
      and is_guest = true
      and status = '결제대기';
end;
$$;

revoke all on function cancel_pending_guest_order(text, text) from public;
grant execute on function cancel_pending_guest_order(text, text) to anon;

-- 5) 결제 확정: PortOne 서버 조회로 실결제를 확인한 뒤, Edge Function(서비스 롤 권한)에서만 호출.
--    여기서 결제 금액을 주문 시 계산된 total_amount와 다시 한번 대조(위변조/편취 방지)하고,
--    이 시점에만 재고를 차감한다(결제 대기 중에는 재고를 잠그지 않음).
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
  end loop;

  update orders set status = '결제완료' where id = v_order.id;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function finalize_guest_order(text, boolean, numeric) from public;
grant execute on function finalize_guest_order(text, boolean, numeric) to service_role;

commit;
