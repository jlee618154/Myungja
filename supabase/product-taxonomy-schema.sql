-- 카테고리(대분류)에 SET 추가, 소분류(subcategory) 컬럼 추가, 기존 9개 상품 소분류 배정
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

alter type product_category add value if not exists 'SET';

begin;

alter table products add column if not exists subcategory text;

-- 기존 상품을 실제 상품명/설명을 보고 소분류에 배정
update products set subcategory = '브라탑' where slug = 'signature-airfit-bra';
update products set subcategory = '브라탑' where slug = 'airy-knit-bra-top';
update products set subcategory = '티셔츠' where slug = 'cool-touch-sleeveless';
update products set subcategory = '티셔츠' where slug = 'daily-round-tee';
update products set subcategory = '티셔츠' where slug = 'soft-jersey-cap-sleeve-tee';
update products set subcategory = '레깅스' where slug = 'soft-jersey-leggings';
update products set subcategory = '자켓' where slug = 'sway-onthego-jacket';
update products set subcategory = '가디건' where slug = 'warming-long-cardigan';
update products set subcategory = '베스트' where slug = 'breeze-crop-half-zip';

-- 베스트셀러 집계: anon은 order_items를 회원 주문까지 전부 읽을 권한이 없으므로(RLS),
-- 전체 주문(회원+비회원)을 서버에서 집계해 순위만 반환하는 함수를 통해 노출한다.
create or replace function get_bestseller_products(p_limit int default 8)
returns table(product_id uuid, total_qty bigint)
language sql
stable
security definer
set search_path = public
as $$
  select oi.product_id, sum(oi.qty)::bigint as total_qty
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.status not in ('취소', '결제대기')
  group by oi.product_id
  order by total_qty desc
  limit p_limit;
$$;

grant execute on function get_bestseller_products(int) to anon, authenticated;

commit;
