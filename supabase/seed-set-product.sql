-- SET 카테고리 첫 실제 세트 상품 추가: 시그니처 에어핏 브라탑 + 소프트 저지 레깅스
-- (기존 두 단품을 묶은 실제 조합. 정가 130,000원 -> 세트 할인 117,000원)
-- 브라탑/레깅스가 각각 다른 색상으로 촬영되어 있어, 색상 선택 없이 "블랙+브라운" 고정 조합 1종으로 구성.
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

begin;

insert into products (
  slug, category, subcategory, name, price, original_price,
  summary, concept, fit, movement, material, care, activity,
  base_image_url, fullscreen_image_url, rating, review_count, is_active
)
select
  'signature-airfit-legging-set', 'SET', '위아래 세트', '시그니처 에어핏 브라탑 + 저지 레깅스 세트', 117000, 130000,
  '조이지 않는 편안함을 위아래로 완성하는 세트',
  '가슴을 압박하지 않는 시그니처 브라탑과, 몸에 붙지만 조이지 않는 저지 레깅스를 함께 구성한 위아래 세트입니다. 따로 구매하는 것보다 합리적인 가격으로 완성된 룩을 제안합니다.',
  '브라탑은 넉넉한 여유분으로 답답함 없는 실루엣을, 레깅스는 넓은 배내기 밴드로 허리와 배를 편안하게 감싸는 골반 라인 핏으로 구성했습니다.',
  '4방향 스트레치 브라탑과 사방 스트레치 레깅스 모두 요가, 필라테스부터 가벼운 러닝까지 자유로운 움직임을 지지합니다.',
  '브라탑 나일론 78% / 스판덱스 22%, 레깅스 폴리에스터 72% / 스판덱스 28%',
  '두 제품 모두 찬물 손세탁 후 그늘에서 건조해 주세요. 표백제·건조기 사용은 피해 주세요.',
  '요가, 필라테스, 마라톤, 데일리 룩',
  'images/airfit-bra-black-1.png', null, 0, 0, true
where not exists (select 1 from products where slug = 'signature-airfit-legging-set');

with p as (select id from products where slug = 'signature-airfit-legging-set')
insert into product_options (product_id, color_name, color_hex, size, stock_qty)
select p.id, '블랙+브라운', '#1C1C1C', s.size::product_size, 8
from p, (values ('S'), ('M'), ('L'), ('XL')) as s(size)
where not exists (select 1 from product_options po where po.product_id = p.id);

with p as (select id from products where slug = 'signature-airfit-legging-set')
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, '블랙+브라운', v.sort_order, v.image_url
from p, (values
  (0, 'images/airfit-bra-black-1.png'),
  (1, 'images/airfit-bra-black-2.png'),
  (2, 'images/leggings-brown-1.png')
) as v(sort_order, image_url)
where not exists (select 1 from product_images pi where pi.product_id = p.id);

commit;
