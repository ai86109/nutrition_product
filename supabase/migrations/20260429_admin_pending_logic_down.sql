-- =====================================================================
-- DOWN MIGRATION: 還原 20260429_admin_pending_logic_up.sql
-- Created: 2026-04-29
-- 說明：
--   1) update_product_status 還原為含 nutrition_facts 空值守衛的版本
--   2) drop get_pending_product_count
-- =====================================================================

-- 1. 還原 update_product_status 到含空值守衛的版本
create or replace function public.update_product_status(
  target_license_no text,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  if new_status not in ('active', 'inactive', 'extension_pending') then
    raise exception 'invalid product_status: %', new_status;
  end if;

  if not exists (
    select 1 from public.products p
    where p.license_no = target_license_no
  ) then
    raise exception 'product not found: %', target_license_no;
  end if;

  if exists (
    select 1 from public.products p
    where p.license_no = target_license_no
      and (p.nutrition_facts is null
           or p.nutrition_facts::text = '{}'::text)
  ) then
    raise exception 'cannot update status while nutrition_facts is empty (pending review): %', target_license_no;
  end if;

  update public.products
    set product_status = new_status
    where license_no = target_license_no;
end;
$$;

-- 2. 移除 get_pending_product_count
drop function if exists public.get_pending_product_count();
