-- The 6 new products' seed script mistakenly copied the single photographed
-- color's images to every other color option too, so every color silently
-- showed the same (mislabeled) photo instead of a "no photo yet" state.
-- This removes the images for every color EXCEPT the one that was actually
-- photographed, so ProductDetail's existing "해당 색상 이미지를 준비 중입니다"
-- fallback correctly kicks in for the rest.

delete from product_images
where product_id = (select id from products where slug = 'airy-knit-bra-top')
  and color_name <> '그레이';

delete from product_images
where product_id = (select id from products where slug = 'breeze-crop-half-zip')
  and color_name <> '블랙';

delete from product_images
where product_id = (select id from products where slug = 'cool-touch-sleeveless')
  and color_name <> '블랙';

delete from product_images
where product_id = (select id from products where slug = 'daily-round-tee')
  and color_name <> '화이트';

delete from product_images
where product_id = (select id from products where slug = 'soft-jersey-cap-sleeve-tee')
  and color_name <> '베이지';

delete from product_images
where product_id = (select id from products where slug = 'warming-long-cardigan')
  and color_name <> '연베이지';
