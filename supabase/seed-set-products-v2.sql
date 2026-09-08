-- SET 상품 재구성: 실제 판매 중인 상의/하의를 조합해 소분류별로 2~3개씩 구성.
-- "브라탑 + 레깅스 세트" = 브라탑 상품 + 레깅스, "위아래 세트" = 티셔츠류 + 레깅스(현재 하의는 레깅스만 존재).
-- 모든 세트는 (상의가격 + 하의가격) 대비 약 10~12% 할인가로 책정, original_price에 정가(합산가) 저장 -> 세일 필터에도 자동 반영.
-- 이미지: 각 세트의 두 번째 슬라이드(sort_order=1)에 하의 사진을 배치해 카드 호버/캐러셀에서 바로 보이도록 함.
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

begin;

-- 기존 "시그니처 에어핏 브라탑 + 저지 레깅스 세트"는 브라탑 조합이므로 소분류를 "브라탑 레깅스 세트"로 재분류
update products set subcategory = '브라탑 레깅스 세트'
where slug = 'signature-airfit-legging-set';

-- 1) 에어리 니트 브라탑(그레이) + 소프트 저지 레깅스(퍼플) -> 브라탑 레깅스 세트
insert into products (
  slug, category, subcategory, name, price, original_price,
  summary, concept, fit, movement, material, care, activity,
  base_image_url, fullscreen_image_url, rating, review_count, is_active
)
select
  'airy-knit-legging-set', 'SET', '브라탑 레깅스 세트', '에어리 니트 브라탑 + 저지 레깅스 세트', 99000, 113000,
  '니트의 부드러움과 레깅스의 유연함을 한 번에',
  '니트의 부드러움과 브라탑의 안정감을 더한 에어리 니트 브라탑과, 몸에 붙지만 조이지 않는 저지 레깅스를 함께 구성한 세트입니다.',
  '브라탑은 넉넉한 여유분으로 답답함 없는 실루엣을, 레깅스는 넓은 배내기 밴드로 허리와 배를 편안하게 감싸는 골반 라인 핏으로 구성했습니다.',
  '4방향 스트레치 니트와 사방 스트레치 저지 원단 모두 요가, 필라테스부터 가벼운 러닝까지 편안하게 지지합니다.',
  '브라탑 니트 혼방, 레깅스 폴리에스터 72% / 스판덱스 28%',
  '두 제품 모두 찬물 손세탁 후 그늘에서 건조해 주세요. 표백제·건조기 사용은 피해 주세요.',
  '요가, 필라테스, 데일리 룩',
  'images/airy-knit-bra-black-1.png', null, 0, 0, true
where not exists (select 1 from products where slug = 'airy-knit-legging-set');

-- 2) 쿨터치 슬리브리스(블랙) + 소프트 저지 레깅스(브라운) -> 위아래 세트
insert into products (
  slug, category, subcategory, name, price, original_price,
  summary, concept, fit, movement, material, care, activity,
  base_image_url, fullscreen_image_url, rating, review_count, is_active
)
select
  'cool-touch-legging-set', 'SET', '위아래 세트', '쿨터치 슬리브리스 + 저지 레깅스 세트', 94000, 107000,
  '시원한 터치감의 슬리브리스와 편안한 레깅스 세트',
  '시원한 터치감의 간결한 슬리브리스와, 몸에 붙지만 조이지 않는 저지 레깅스를 함께 구성한 위아래 세트입니다.',
  '슬리브리스는 몸을 과하게 드러내지 않는 적당한 여유의 실루엣, 레깅스는 골반 라인을 따라 넉넉한 핏으로 재단했습니다.',
  '두 제품 모두 사방 스트레치 원단으로 앉고 서고 걷는 일상 동작은 물론 가벼운 러닝까지 편안합니다.',
  '슬리브리스 쿨터치 원단, 레깅스 폴리에스터 72% / 스판덱스 28%',
  '두 제품 모두 찬물 세탁 후 그늘에서 건조해 주세요.',
  '러닝, 걷기 운동, 데일리 룩',
  'images/cool-touch-sleeveless-black-1.png', null, 0, 0, true
where not exists (select 1 from products where slug = 'cool-touch-legging-set');

-- 3) 데일리 라운드 반팔티(화이트) + 소프트 저지 레깅스(퍼플) -> 위아래 세트
insert into products (
  slug, category, subcategory, name, price, original_price,
  summary, concept, fit, movement, material, care, activity,
  base_image_url, fullscreen_image_url, rating, review_count, is_active
)
select
  'daily-tee-legging-set', 'SET', '위아래 세트', '데일리 라운드 반팔티 + 저지 레깅스 세트', 102000, 116000,
  '단정한 반팔티와 편안한 레깅스로 완성하는 데일리 세트',
  '단정하게 걸치는 기본 라운드 반팔티와, 몸에 붙지만 조이지 않는 저지 레깅스를 함께 구성한 위아래 세트입니다.',
  '반팔티는 과하지 않은 기본 실루엣, 레깅스는 넓은 배내기 밴드로 허리와 배를 편안하게 감싸는 핏입니다.',
  '레깅스의 사방 스트레치 원단이 가벼운 러닝 동작까지 편안하게 받쳐줍니다.',
  '반팔티 코튼 혼방, 레깅스 폴리에스터 72% / 스판덱스 28%',
  '두 제품 모두 찬물 세탁 후 그늘에서 건조해 주세요.',
  '데일리 룩, 가벼운 산책, 걷기 운동',
  'images/daily-round-tee-white-1.png', null, 0, 0, true
where not exists (select 1 from products where slug = 'daily-tee-legging-set');

-- 4) 소프트 저지 캡슬리브 티(베이지) + 소프트 저지 레깅스(브라운) -> 위아래 세트
insert into products (
  slug, category, subcategory, name, price, original_price,
  summary, concept, fit, movement, material, care, activity,
  base_image_url, fullscreen_image_url, rating, review_count, is_active
)
select
  'cap-sleeve-legging-set', 'SET', '위아래 세트', '소프트 저지 캡슬리브 티 + 저지 레깅스 세트', 97000, 110000,
  '베이지 톤으로 맞춘 캡슬리브 티와 레깅스 세트',
  '유연한 드레이프의 캡소매 저지 티와, 몸에 붙지만 조이지 않는 저지 레깅스를 베이지·브라운 톤으로 맞춘 위아래 세트입니다.',
  '캡슬리브 티는 어깨선을 편안하게 감싸는 여유로운 실루엣, 레깅스는 골반 라인을 따라 넉넉한 핏으로 재단했습니다.',
  '두 제품 모두 사방 스트레치 저지 원단으로 하루 종일 편안한 움직임을 지지합니다.',
  '캡슬리브 티/레깅스 모두 폴리에스터·스판덱스 혼방 저지 원단',
  '두 제품 모두 찬물 세탁 후 그늘에서 건조해 주세요.',
  '요가, 데일리 룩, 가벼운 산책',
  'images/soft-cap-sleeve-tee-beige-1.png', null, 0, 0, true
where not exists (select 1 from products where slug = 'cap-sleeve-legging-set');

-- 옵션(사이즈) + 이미지(상의 -> 하의 -> 상의2 -> 하의2 순서로, 하의가 항상 2번째 슬라이드에 오도록)

with p as (select id, '그레이+퍼플'::text as color_name from products where slug = 'airy-knit-legging-set')
insert into product_options (product_id, color_name, color_hex, size, stock_qty)
select p.id, p.color_name, '#8B8B8B', s.size::product_size, 8
from p, (values ('S'), ('M'), ('L'), ('XL')) as s(size)
where not exists (select 1 from product_options po where po.product_id = p.id);

with p as (select id, '그레이+퍼플'::text as color_name from products where slug = 'airy-knit-legging-set')
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, p.color_name, v.sort_order, v.image_url
from p, (values
  (0, 'images/airy-knit-bra-black-1.png'),
  (1, 'images/leggings-purple-1.png'),
  (2, 'images/airy-knit-bra-black-2.png'),
  (3, 'images/leggings-purple-2.png')
) as v(sort_order, image_url)
where not exists (select 1 from product_images pi where pi.product_id = p.id);

with p as (select id, '블랙+브라운'::text as color_name from products where slug = 'cool-touch-legging-set')
insert into product_options (product_id, color_name, color_hex, size, stock_qty)
select p.id, p.color_name, '#1C1C1C', s.size::product_size, 8
from p, (values ('S'), ('M'), ('L'), ('XL')) as s(size)
where not exists (select 1 from product_options po where po.product_id = p.id);

with p as (select id, '블랙+브라운'::text as color_name from products where slug = 'cool-touch-legging-set')
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, p.color_name, v.sort_order, v.image_url
from p, (values
  (0, 'images/cool-touch-sleeveless-black-1.png'),
  (1, 'images/leggings-brown-1.png'),
  (2, 'images/cool-touch-sleeveless-black-2.png'),
  (3, 'images/leggings-brown-2.png')
) as v(sort_order, image_url)
where not exists (select 1 from product_images pi where pi.product_id = p.id);

with p as (select id, '화이트+퍼플'::text as color_name from products where slug = 'daily-tee-legging-set')
insert into product_options (product_id, color_name, color_hex, size, stock_qty)
select p.id, p.color_name, '#F5F5F0', s.size::product_size, 8
from p, (values ('S'), ('M'), ('L'), ('XL')) as s(size)
where not exists (select 1 from product_options po where po.product_id = p.id);

with p as (select id, '화이트+퍼플'::text as color_name from products where slug = 'daily-tee-legging-set')
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, p.color_name, v.sort_order, v.image_url
from p, (values
  (0, 'images/daily-round-tee-white-1.png'),
  (1, 'images/leggings-purple-1.png'),
  (2, 'images/daily-round-tee-white-2.png'),
  (3, 'images/leggings-purple-2.png')
) as v(sort_order, image_url)
where not exists (select 1 from product_images pi where pi.product_id = p.id);

with p as (select id, '베이지+브라운'::text as color_name from products where slug = 'cap-sleeve-legging-set')
insert into product_options (product_id, color_name, color_hex, size, stock_qty)
select p.id, p.color_name, '#D8C9B0', s.size::product_size, 8
from p, (values ('S'), ('M'), ('L'), ('XL')) as s(size)
where not exists (select 1 from product_options po where po.product_id = p.id);

with p as (select id, '베이지+브라운'::text as color_name from products where slug = 'cap-sleeve-legging-set')
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, p.color_name, v.sort_order, v.image_url
from p, (values
  (0, 'images/soft-cap-sleeve-tee-beige-1.png'),
  (1, 'images/leggings-brown-1.png'),
  (2, 'images/soft-cap-sleeve-tee-beige-2.png'),
  (3, 'images/leggings-brown-2.png')
) as v(sort_order, image_url)
where not exists (select 1 from product_images pi where pi.product_id = p.id);

commit;
