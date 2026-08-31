-- Admin dashboard support: role column, tracking number, and RLS policies
-- granting admin-flagged users full read/write on orders/products.
-- Run once in the Supabase SQL editor.

begin;

-- 1) Admin role flag on profiles
alter table profiles add column if not exists is_admin boolean not null default false;

-- 2) Tracking number for shipped orders
alter table orders add column if not exists tracking_number text;

-- 3) Mark yourself as admin (edit the email, then run this line manually — commented
--    out so this script doesn't silently promote the wrong account on a blind run)
-- update profiles set is_admin = true
-- where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com');

-- 4) Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- 5) RLS: admins can read/write everything relevant to the dashboard.
-- These are additive policies — they don't remove any existing customer-facing
-- policies, they just give is_admin() users an additional way to pass the check.

alter table orders enable row level security;
alter table order_items enable row level security;
alter table products enable row level security;
alter table product_options enable row level security;
alter table product_images enable row level security;
alter table profiles enable row level security;

drop policy if exists admin_all_orders on orders;
create policy admin_all_orders on orders
  for all using (is_admin()) with check (is_admin());

drop policy if exists admin_all_order_items on order_items;
create policy admin_all_order_items on order_items
  for all using (is_admin()) with check (is_admin());

drop policy if exists admin_all_products on products;
create policy admin_all_products on products
  for all using (is_admin()) with check (is_admin());

drop policy if exists admin_all_product_options on product_options;
create policy admin_all_product_options on product_options
  for all using (is_admin()) with check (is_admin());

drop policy if exists admin_all_product_images on product_images;
create policy admin_all_product_images on product_images
  for all using (is_admin()) with check (is_admin());

-- admins can look up any profile (e.g. to show customer name/email on an order),
-- customers keep their existing "own profile only" policy untouched
drop policy if exists admin_read_profiles on profiles;
create policy admin_read_profiles on profiles
  for select using (is_admin());

commit;

-- 6) Storage bucket for product image uploads (product management tab).
-- Not wrapped in the transaction above because storage functions run outside
-- the public schema's transactional DDL in some Supabase versions.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists admin_upload_product_images on storage.objects;
create policy admin_upload_product_images on storage.objects
  for all using (bucket_id = 'product-images' and is_admin())
  with check (bucket_id = 'product-images' and is_admin());

drop policy if exists public_read_product_images on storage.objects;
create policy public_read_product_images on storage.objects
  for select using (bucket_id = 'product-images');
