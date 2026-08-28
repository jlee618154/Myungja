-- The 6 new products were already created (in an earlier run) before the
-- fullscreen_image_url values were corrected to point at the real front/back
-- wear-view photos. seed-new-products.sql's "where not exists" guard means
-- re-running it skips these rows entirely, so it never applied the fix.
-- This updates the existing rows directly.

update products set fullscreen_image_url = 'images/airy-front-back.png'
where slug = 'airy-knit-bra-top';

update products set fullscreen_image_url = 'images/breeze-front-back.png'
where slug = 'breeze-crop-half-zip';

update products set fullscreen_image_url = 'images/cool-front-back.png'
where slug = 'cool-touch-sleeveless';

update products set fullscreen_image_url = 'images/daily-front-back.png'
where slug = 'daily-round-tee';

update products set fullscreen_image_url = 'images/soft-front-back.png'
where slug = 'soft-jersey-cap-sleeve-tee';

update products set fullscreen_image_url = 'images/warming-front-back.png'
where slug = 'warming-long-cardigan';
