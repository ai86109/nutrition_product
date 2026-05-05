-- =====================================================================
-- DOWN MIGRATION: Revert get_admin_product_list to without image_count
-- Created: 2026-05-05
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
  has_nutrition_facts boolean
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
     and p.nutrition_facts::text <> '{}'::text) as has_nutrition_facts
  from public.products p
  order by p.license_no;
end;
$$;
