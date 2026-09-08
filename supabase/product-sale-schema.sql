-- 세일(할인) 지원 및 TOP 소분류 재구성(티셔츠 -> 반팔·민소매/긴팔·집업)
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

begin;

alter table products add column if not exists original_price numeric;

-- TOP 소분류 재구성: 기존 '티셔츠' 3개 상품을 소매 기장 기준으로 재배정
-- (모두 반팔/민소매 계열이라 '긴팔·집업'에 해당하는 상품은 아직 없음)
update products set subcategory = '반팔·민소매' where slug = 'cool-touch-sleeveless';
update products set subcategory = '반팔·민소매' where slug = 'daily-round-tee';
update products set subcategory = '반팔·민소매' where slug = 'soft-jersey-cap-sleeve-tee';

-- 세일 예시: 실제 상품 2개에 정가(original_price) 대비 할인가 적용
update products set original_price = 58000 where slug = 'daily-round-tee';
update products set original_price = 138000 where slug = 'sway-onthego-jacket';

commit;
