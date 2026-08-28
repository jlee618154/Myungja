-- Adds the 6 genuinely new products extracted from the product-*.html mockups.
-- (product-bra.html, product-leggings.html, product-outer-sway.html were skipped —
-- they are mockups of the 3 products already registered: signature-airfit-bra,
-- soft-jersey-leggings, sway-onthego-jacket — same name/price/category.)
--
-- Run this once in the Supabase SQL editor (anon key cannot write; RLS blocks it by design).
-- Safe to re-run: each product block is guarded by "where not exists", so running this
-- script twice will not create duplicate products/options/images.

begin;

-- 1) 에어리 니트 브라탑 (TOP)
with p as (
  insert into products (slug, category, name, price, summary, concept, fit, movement, material, care, activity, base_image_url, fullscreen_image_url)
  select
    'airy-knit-bra-top', 'TOP', '에어리 니트 브라탑', 45000,
    '니트의 부드러움과 브라탑의 안정감을 한 번에',
    '촘촘하지만 가볍게 늘어나는 니트 조직이 가슴선을 압박하지 않고 자연스럽게 정돈합니다. 봉제선이 도드라지지 않아 피부에 닿는 느낌이 부드럽고, 일상과 가벼운 스트레칭에 편안합니다.',
    '신축성 있는 슬림 핏 · 가벼운 라이트 서포트',
    '실리콘 소프트 워싱과 저온 셋팅으로 니트 표면의 까슬거림을 줄이고 형태 회복력을 높였습니다.',
    '소프트 니트 나일론 88% · 스판덱스 12%',
    '미지근한 물보다 찬물을 사용해 세탁망에 넣어주세요. 옷걸이 건조 대신 형태를 정돈해 그늘에서 평평하게 건조하는 것을 권장합니다.',
    '요가, 필라테스, 데일리 이너웨어',
    'images/airy-knit-bra-black-1.png', 'images/airy-knit-bra-black-2.png'
  where not exists (select 1 from products where slug = 'airy-knit-bra-top')
  returning id
),
o as (
  insert into product_options (product_id, color_name, color_hex, size, stock_qty)
  select p.id, c.color_name, c.color_hex, s.size::product_size, 20
  from p, (values ('그레이','#b9b4ac'),('샌드베이지','#d8c6a8'),('브라운','#6e5644'),('블랙','#1e1912')) as c(color_name, color_hex)
  cross join (values ('S'),('M'),('L'),('XL')) as s(size)
  returning 1
)
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, c.color_name, i.sort_order, i.image_url
from p
cross join (values ('그레이'),('샌드베이지'),('브라운'),('블랙')) as c(color_name)
cross join (values (0, 'images/airy-knit-bra-black-1.png'), (1, 'images/airy-knit-bra-black-2.png')) as i(sort_order, image_url);


-- 2) 브리즈 크롭 반집업 (OUTER)
with p as (
  insert into products (slug, category, name, price, summary, concept, fit, movement, material, care, activity, base_image_url, fullscreen_image_url)
  select
    'breeze-crop-half-zip', 'OUTER', '브리즈 크롭 반집업', 72000,
    '가볍게 여닫는 하프 집업 크롭 아우터',
    '목을 편안하게 감싸는 하프 집업과 허리선이 길어 보이는 크롭 기장이 활동적인 실루엣을 만듭니다. 운동 전후에는 지퍼를 올려 보온하고, 산책 중에는 열어 자연스럽게 환기할 수 있습니다.',
    '여유 있는 스탠더드 핏 · 골반 위에 닿는 크롭 기장',
    '저온 릴랙스 워싱 후 흡한속건 가공을 적용해 원단의 뻣뻣함과 세탁 후 수축을 줄였습니다.',
    '경량 기능성 폴리에스터 88% · 스판덱스 12%',
    '지퍼를 끝까지 잠근 뒤 뒤집어 찬물 세탁하세요. 섬유유연제를 과하게 사용하면 흡한속건 기능이 저하될 수 있습니다.',
    '러닝, 가벼운 등산, 데일리 아우터',
    'images/breeze-crop-halfzip-black-1.png', 'images/breeze-crop-halfzip-black-2.png'
  where not exists (select 1 from products where slug = 'breeze-crop-half-zip')
  returning id
),
o as (
  insert into product_options (product_id, color_name, color_hex, size, stock_qty)
  select p.id, c.color_name, c.color_hex, s.size::product_size, 20
  from p, (values ('블랙','#1e1912'),('베이지','#d8c6a8'),('퍼플','#7c6c9c'),('진네이비','#2c3550')) as c(color_name, color_hex)
  cross join (values ('S'),('M'),('L'),('XL')) as s(size)
  returning 1
)
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, c.color_name, i.sort_order, i.image_url
from p
cross join (values ('블랙'),('베이지'),('퍼플'),('진네이비')) as c(color_name)
cross join (values (0, 'images/breeze-crop-halfzip-black-1.png'), (1, 'images/breeze-crop-halfzip-black-2.png')) as i(sort_order, image_url);


-- 3) 쿨터치 슬리브리스 (TOP)
with p as (
  insert into products (slug, category, name, price, summary, concept, fit, movement, material, care, activity, base_image_url, fullscreen_image_url)
  select
    'cool-touch-sleeveless', 'TOP', '쿨터치 슬리브리스', 39000,
    '시원한 터치감의 간결한 슬리브리스',
    '몸을 타고 흐르는 간결한 실루엣과 시원한 터치감이 특징입니다. 암홀은 속옷이 과하게 드러나지 않도록 안정적으로 설계해 운동부터 데일리웨어까지 활용하기 좋습니다.',
    '가슴은 안정적이고 몸통은 편안한 세미 슬림 핏',
    '접촉 냉감 피니시와 흡한속건 가공을 더하고, 저온 텐터링으로 세탁 후 형태 변형을 최소화했습니다.',
    '쿨터치 나일론 76% · 폴리에스터 16% · 스판덱스 8%',
    '땀을 흘린 뒤에는 오래 두지 말고 찬물에 세탁하세요. 건조기와 뜨거운 물은 냉감 기능과 신축성을 떨어뜨릴 수 있습니다.',
    '여름 러닝, 요가, 데일리',
    'images/cool-touch-sleeveless-black-1.png', 'images/cool-touch-sleeveless-black-2.png'
  where not exists (select 1 from products where slug = 'cool-touch-sleeveless')
  returning id
),
o as (
  insert into product_options (product_id, color_name, color_hex, size, stock_qty)
  select p.id, c.color_name, c.color_hex, s.size::product_size, 20
  from p, (values ('블랙','#1e1912'),('네이비','#2c3550'),('퍼플','#7c6c9c')) as c(color_name, color_hex)
  cross join (values ('S'),('M'),('L'),('XL')) as s(size)
  returning 1
)
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, c.color_name, i.sort_order, i.image_url
from p
cross join (values ('블랙'),('네이비'),('퍼플')) as c(color_name)
cross join (values (0, 'images/cool-touch-sleeveless-black-1.png'), (1, 'images/cool-touch-sleeveless-black-2.png')) as i(sort_order, image_url);


-- 4) 데일리 라운드 반팔티 (TOP)
with p as (
  insert into products (slug, category, name, price, summary, concept, fit, movement, material, care, activity, base_image_url, fullscreen_image_url)
  select
    'daily-round-tee', 'TOP', '데일리 라운드 반팔티', 48000,
    '단정하게 걸치는 기본 라운드 반팔티',
    '목선을 답답하지 않게 감싸는 라운드넥과 팔을 편안하게 덮는 소매 길이로 단정한 인상을 줍니다. 요가복 위에 가볍게 입거나 데님과 매치하기 좋은 기본 티셔츠입니다.',
    '몸의 선을 과하게 드러내지 않는 레귤러 핏',
    '바이오 엔자임 워싱으로 잔털과 거친 촉감을 정리하고, 덤블 워싱으로 세탁 후 수축을 안정화했습니다.',
    '코튼 55% · 모달 39% · 스판덱스 6%',
    '비슷한 색상끼리 찬물 세탁하고 그늘에서 자연 건조하세요. 프린트나 원단 손상을 줄이려면 뒤집어 세탁하는 것이 좋습니다.',
    '데일리, 가벼운 산책, 이너웨어',
    'images/daily-round-tee-white-1.png', 'images/daily-round-tee-white-2.png'
  where not exists (select 1 from products where slug = 'daily-round-tee')
  returning id
),
o as (
  insert into product_options (product_id, color_name, color_hex, size, stock_qty)
  select p.id, c.color_name, c.color_hex, s.size::product_size, 20
  from p, (values ('화이트','#faf7f0'),('블랙','#1e1912'),('샌디베이지','#d8c6a8'),('카키','#7c7a54'),('라벤더','#b9afd6')) as c(color_name, color_hex)
  cross join (values ('S'),('M'),('L'),('XL')) as s(size)
  returning 1
)
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, c.color_name, i.sort_order, i.image_url
from p
cross join (values ('화이트'),('블랙'),('샌디베이지'),('카키'),('라벤더')) as c(color_name)
cross join (values (0, 'images/daily-round-tee-white-1.png'), (1, 'images/daily-round-tee-white-2.png')) as i(sort_order, image_url);


-- 5) 소프트 저지 캡슬리브 티 (TOP)
with p as (
  insert into products (slug, category, name, price, summary, concept, fit, movement, material, care, activity, base_image_url, fullscreen_image_url)
  select
    'soft-jersey-cap-sleeve-tee', 'TOP', '소프트 저지 캡슬리브 티', 42000,
    '유연한 드레이프의 캡소매 저지 티',
    '짧은 캡소매가 어깨와 팔의 움직임을 방해하지 않으면서 상체선을 자연스럽게 정돈합니다. 모달이 섞인 저지의 유연한 드레이프가 편안하고 여성스러운 실루엣을 완성합니다.',
    '어깨는 가볍게 감싸고 허리는 여유로운 세미 슬림 핏',
    '바이오 워싱으로 표면을 매끄럽게 정리한 뒤 실리콘 소프트 가공을 더해 반복 세탁 후에도 유연한 촉감을 유지합니다.',
    '모달 48% · 코튼 46% · 스판덱스 6%',
    '찬물의 약한 코스로 세탁망 사용을 권장합니다. 젖은 상태에서 비틀어 짜지 말고 형태를 정돈해 건조하세요.',
    '데일리, 사무실 이너웨어, 가벼운 외출',
    'images/soft-cap-sleeve-tee-beige-1.png', 'images/soft-cap-sleeve-tee-beige-2.png'
  where not exists (select 1 from products where slug = 'soft-jersey-cap-sleeve-tee')
  returning id
),
o as (
  insert into product_options (product_id, color_name, color_hex, size, stock_qty)
  select p.id, c.color_name, c.color_hex, s.size::product_size, 20
  from p, (values ('베이지','#d8c6a8'),('브라운','#6e5644'),('샌드베이지','#c9a87e')) as c(color_name, color_hex)
  cross join (values ('S'),('M'),('L'),('XL')) as s(size)
  returning 1
)
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, c.color_name, i.sort_order, i.image_url
from p
cross join (values ('베이지'),('브라운'),('샌드베이지')) as c(color_name)
cross join (values (0, 'images/soft-cap-sleeve-tee-beige-1.png'), (1, 'images/soft-cap-sleeve-tee-beige-2.png')) as i(sort_order, image_url);


-- 6) 워밍 롱 카디건 (OUTER)
with p as (
  insert into products (slug, category, name, price, summary, concept, fit, movement, material, care, activity, base_image_url, fullscreen_image_url)
  select
    'warming-long-cardigan', 'OUTER', '워밍 롱 카디건', 98000,
    '체형을 편안하게 덮는 롱 기장 카디건',
    '힙을 덮는 안정적인 길이와 자연스럽게 떨어지는 앞여밈이 체형을 편안하게 커버합니다. 가벼운 스트레칭, 산책, 이동 시간에 부담 없이 걸칠 수 있는 데일리 아우터입니다.',
    '힙을 덮는 롱 기장 · 여유로운 오픈 프런트 핏',
    '안쪽에 미세 피치 가공을 적용해 보온감을 높이고, 프리슈렁크 워싱으로 세탁 후 길이 변화를 줄였습니다.',
    '레이온 48% · 폴리에스터 46% · 스판덱스 6%',
    '세탁망에 넣어 찬물 울 코스로 세탁하세요. 보풀이 생기지 않도록 거친 소재와 분리하고, 옷걸이보다 접어서 보관하는 것을 권장합니다.',
    '산책, 이동, 가벼운 스트레칭',
    'images/warming-cardigan-beige-1.png', 'images/warming-cardigan-beige-2.png'
  where not exists (select 1 from products where slug = 'warming-long-cardigan')
  returning id
),
o as (
  insert into product_options (product_id, color_name, color_hex, size, stock_qty)
  select p.id, c.color_name, c.color_hex, s.size::product_size, 20
  from p, (values ('연베이지','#ede3cf'),('베이지','#d8c6a8'),('차콜','#3b3b3b'),('네이비블루','#2c3550'),('퍼플','#7c6c9c')) as c(color_name, color_hex)
  cross join (values ('S'),('M'),('L'),('XL')) as s(size)
  returning 1
)
insert into product_images (product_id, color_name, sort_order, image_url)
select p.id, c.color_name, i.sort_order, i.image_url
from p
cross join (values ('연베이지'),('베이지'),('차콜'),('네이비블루'),('퍼플')) as c(color_name)
cross join (values (0, 'images/warming-cardigan-beige-1.png'), (1, 'images/warming-cardigan-beige-2.png')) as i(sort_order, image_url);

commit;
