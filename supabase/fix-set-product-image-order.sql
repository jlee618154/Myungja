-- 원인: 브라탑/레깅스 이미지가 상품에 다 연결은 돼 있었지만(3장 모두 정상 존재),
-- 정렬 순서(sort_order)가 [브라탑, 브라탑, 레깅스] 순이라 레깅스 사진이 3번째(마지막)에
-- 묻혀 있었음. 상품 카드의 "호버 시 다음 이미지" 로직은 정확히 sort_order=1을 보여주는데
-- 그 자리도 브라탑 사진이라, 카드에서는 레깅스가 아예 노출될 기회가 없었음.
-- -> 레깅스 사진을 sort_order=1로 옮겨서, 카드 호버 시 바로 레깅스가 보이도록 수정.
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

begin;

update product_images
set sort_order = 1
where product_id = (select id from products where slug = 'signature-airfit-legging-set')
  and image_url = 'images/leggings-brown-1.png';

update product_images
set sort_order = 2
where product_id = (select id from products where slug = 'signature-airfit-legging-set')
  and image_url = 'images/airfit-bra-black-2.png';

commit;
