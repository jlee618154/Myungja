-- checkout_create_order(회원 장바구니 결제)에 SET 상품 상의/하의 옵션 지원 추가.
-- 원본 함수 로직(재고 검증/차감, 쿠폰, 적립금, 주문 생성, order_items 생성, 적립 등)은
-- 100% 그대로 유지하고, 상품이 SET(top_product_id/bottom_product_id 있음)인 경우에만
-- 실제 원상품(상의/하의) product_options에서 재고를 검증/차감하도록 분기만 추가했다.
-- 기존 단품 상품 흐름은 else 분기로 원본 그대로 실행된다.
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

CREATE OR REPLACE FUNCTION public.checkout_create_order(p_items jsonb, p_orderer_name text, p_orderer_phone text, p_recipient_name text, p_recipient_phone text, p_zonecode text, p_address1 text, p_address2 text, p_delivery_request text, p_coupon_id uuid, p_points_to_use integer, p_payment_method text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_item jsonb;
  v_product record;
  v_option record;
  v_top_option record;
  v_bottom_option record;
  v_subtotal integer := 0;
  v_shipping integer := 0;
  v_coupon_discount integer := 0;
  v_points_balance integer := 0;
  v_total integer := 0;
  v_order_id uuid;
  v_order_no text;
  v_coupon record;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid and is_active = true;
    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;

    if v_product.top_product_id is not null and v_product.bottom_product_id is not null then
      -- SET 상품: 상의/하의 각각 실제 원상품 옵션에서 재고 검증 및 차감
      if (v_item->>'top_color_name') is null or (v_item->>'top_size') is null
         or (v_item->>'bottom_color_name') is null or (v_item->>'bottom_size') is null then
        raise exception 'OPTION_NOT_FOUND';
      end if;

      select * into v_top_option from public.product_options
        where product_id = v_product.top_product_id
          and color_name = (v_item->>'top_color_name')
          and size = (v_item->>'top_size')::product_size
        for update;
      if not found then
        raise exception 'OPTION_NOT_FOUND';
      end if;
      if v_top_option.stock_qty < (v_item->>'qty')::integer then
        raise exception 'OUT_OF_STOCK: %', v_product.name;
      end if;

      select * into v_bottom_option from public.product_options
        where product_id = v_product.bottom_product_id
          and color_name = (v_item->>'bottom_color_name')
          and size = (v_item->>'bottom_size')::product_size
        for update;
      if not found then
        raise exception 'OPTION_NOT_FOUND';
      end if;
      if v_bottom_option.stock_qty < (v_item->>'qty')::integer then
        raise exception 'OUT_OF_STOCK: %', v_product.name;
      end if;

      update public.product_options
        set stock_qty = stock_qty - (v_item->>'qty')::integer
        where id = v_top_option.id;

      update public.product_options
        set stock_qty = stock_qty - (v_item->>'qty')::integer
        where id = v_bottom_option.id;
    else
      select * into v_option from public.product_options
        where product_id = v_product.id
          and color_name = (v_item->>'color_name')
          and size = (v_item->>'size')::product_size
        for update;
      if not found then
        raise exception 'OPTION_NOT_FOUND';
      end if;

      if v_option.stock_qty < (v_item->>'qty')::integer then
        raise exception 'OUT_OF_STOCK: %', v_product.name;
      end if;

      update public.product_options
        set stock_qty = stock_qty - (v_item->>'qty')::integer
        where id = v_option.id;
    end if;

    v_subtotal := v_subtotal + v_product.price * (v_item->>'qty')::integer;
  end loop;

  v_shipping := case when v_subtotal >= 30000 then 0 else 3000 end;

  if p_coupon_id is not null then
    select c.* into v_coupon from public.coupons c
      join public.user_coupons uc on uc.coupon_id = c.id
      where c.id = p_coupon_id and uc.user_id = v_uid and uc.is_used = false
        and now() between c.valid_from and c.valid_until
      for update of uc;
    if found and v_subtotal >= v_coupon.min_order_amount then
      v_coupon_discount := case when v_coupon.discount_type = 'percent'
        then floor(v_subtotal * v_coupon.discount_value / 100.0)
        else v_coupon.discount_value end;
      update public.user_coupons set is_used = true, used_at = now()
        where coupon_id = p_coupon_id and user_id = v_uid and is_used = false;
    end if;
  end if;

  select coalesce(sum(case when type = 'earn' then amount else -amount end), 0)
    into v_points_balance from public.points where user_id = v_uid;

  if p_points_to_use is null or p_points_to_use < 0 then
    p_points_to_use := 0;
  end if;
  if p_points_to_use > v_points_balance then
    p_points_to_use := v_points_balance;
  end if;

  v_total := v_subtotal + v_shipping - v_coupon_discount - p_points_to_use;
  if v_total < 0 then
    p_points_to_use := p_points_to_use + v_total;
    v_total := 0;
  end if;

  v_order_no := to_char(now(), 'YYYYMMDDHH24MISS') || lpad(floor(random()*1000)::text, 3, '0');

  insert into public.orders (
    order_no, user_id, orderer_name, orderer_phone, recipient_name, recipient_phone,
    zonecode, address1, address2, delivery_request,
    subtotal, shipping_fee, coupon_discount, points_used, total_amount, payment_method
  ) values (
    v_order_no, v_uid, p_orderer_name, p_orderer_phone, p_recipient_name, p_recipient_phone,
    p_zonecode, p_address1, p_address2, p_delivery_request,
    v_subtotal, v_shipping, v_coupon_discount, p_points_to_use, v_total, p_payment_method
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;

    if v_product.top_product_id is not null and v_product.bottom_product_id is not null then
      insert into public.order_items (
        order_id, product_id, product_name, color_name, size, qty, unit_price,
        top_color_name, top_size, bottom_color_name, bottom_size
      )
      values (
        v_order_id, v_product.id, v_product.name,
        '상의 ' || (v_item->>'top_color_name') || ' ' || (v_item->>'top_size')
          || ' · 하의 ' || (v_item->>'bottom_color_name') || ' ' || (v_item->>'bottom_size'),
        (v_item->>'top_size')::product_size,
        (v_item->>'qty')::integer, v_product.price,
        v_item->>'top_color_name', (v_item->>'top_size')::product_size,
        v_item->>'bottom_color_name', (v_item->>'bottom_size')::product_size
      );
    else
      insert into public.order_items (order_id, product_id, product_name, color_name, size, qty, unit_price)
      values (v_order_id, v_product.id, v_product.name, v_item->>'color_name', (v_item->>'size')::product_size,
        (v_item->>'qty')::integer, v_product.price);
    end if;
  end loop;

  if p_points_to_use > 0 then
    insert into public.points (user_id, amount, type, reason, order_id)
    values (v_uid, p_points_to_use, 'use', '주문 사용', v_order_id);
  end if;

  insert into public.points (user_id, amount, type, reason, order_id)
  values (v_uid, floor(v_total * 0.01), 'earn', '주문 적립', v_order_id);

  delete from public.cart_items where user_id = v_uid;

  return v_order_no;
end;
$function$
