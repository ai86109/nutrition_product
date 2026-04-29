-- =====================================================================
-- UP MIGRATION: 重新定義「待處理」的判定 + 放寬 update_product_status guard
-- Created: 2026-04-29
-- 說明：
--   原規則：nutrition_facts 為空（NULL 或 {}）即視為待處理
--   新規則：product_status = 'active' AND nutrition_facts 為空（NULL 或 {}）
--
--   1) update_product_status：拿掉空值守衛，admin 隨時可以改 status
--      （仍保留 admin 權限檢查與 enum 檢查）
--   2) 新增 get_pending_product_count() RPC，給後台 sidebar 紅點 badge 用
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. update_product_status：移除 nutrition_facts 空值檢查
-- ---------------------------------------------------------------------
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

  update public.products
    set product_status = new_status
    where license_no = target_license_no;

  if not found then
    raise exception 'product not found: %', target_license_no;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 2. get_pending_product_count：撈紅點 badge 用的 count
--    待處理 = product_status = 'active' AND (nutrition_facts IS NULL OR = '{}')
-- ---------------------------------------------------------------------
create or replace function public.get_pending_product_count()
returns integer
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_count integer;
begin
  perform public.assert_caller_is_admin();

  v_count := (
    select count(*)::integer
    from public.products p
    where p.product_status = 'active'
      and (p.nutrition_facts is null
           or p.nutrition_facts::text = '{}'::text)
  );

  return v_count;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. 授權
-- ---------------------------------------------------------------------
revoke all on function public.get_pending_product_count() from public;
grant execute on function public.get_pending_product_count() to authenticated;
