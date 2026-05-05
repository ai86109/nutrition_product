-- =====================================================================
-- UP MIGRATION: Add image_count to get_admin_product_list
-- Created: 2026-05-05
-- 說明：
--   在 get_admin_product_list() 回傳結果加入 image_count 欄位，
--   統計該產品 product_images 中 approved + pending 的圖片數量，
--   讓 admin table 列表可直接顯示圖片數，不需點進去才知道。
-- =====================================================================

drop function if exists public.get_admin_product_list();

create or replace function public.get_admin_product_list()
returns table (
  license_no          text,
  name_zh             text,
  name_en             text,
  brand               text,
  categories          text[],
  is_approved         boolean,
  license_expiry_date date,
  product_status      text,
  has_nutrition_facts boolean,
  image_count         bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  return query
  select
    p.license_no,
    p.name_zh,
    p.name_en,
    p.brand,
    p.categories,
    p.is_approved,
    p.license_expiry_date,
    p.product_status,
    (p.nutrition_facts is not null
     and p.nutrition_facts::text <> '{}'::text) as has_nutrition_facts,
    (
      select count(*)
      from public.product_images pi
      where pi.license_no = p.license_no
        and pi.status in ('approved', 'pending')
    ) as image_count
  from public.products p
  order by p.license_no;
end;
$$;
