-- =====================================================================
-- UP MIGRATION: Admin RPC functions for products management
-- Created: 2026-04-29
-- 說明：
--   後台「營養品管理」頁需要 admin 才能更新 products 的三個欄位：
--     - categories          (text[])
--     - is_approved         (boolean)
--     - product_status      ('active' | 'inactive' | 'extension_pending')
--   為了避免 client 直接 update + RLS 設定遺漏的風險，全部走
--   SECURITY DEFINER RPC，並在 function 內部驗證呼叫者是 admin。
--
--   另外新增 get_admin_product_list() RPC，讓 server component 一次撈出
--   admin 列表所需的全部欄位（含 has_nutrition_facts derived flag）。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. 內部 helper：檢查呼叫者是否為 admin
--    用 EXISTS 寫法避開 PL/pgSQL 在 SELECT INTO 對 reserved word "role"
--    的解析歧義。
-- ---------------------------------------------------------------------
create or replace function public.assert_caller_is_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  ) then
    raise exception 'permission denied: admin role required';
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 1. 撈 admin 列表用的產品（不過濾 nutrition_facts，因為待處理也要列）
-- ---------------------------------------------------------------------
create or replace function public.get_admin_product_list()
returns table (
  license_no text,
  name_zh text,
  name_en text,
  brand text,
  categories text[],
  is_approved boolean,
  license_expiry_date date,
  product_status text,
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


-- ---------------------------------------------------------------------
-- 2. 更新 categories（text[]，可空、可多選）
-- ---------------------------------------------------------------------
create or replace function public.update_product_categories(
  target_license_no text,
  new_categories text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  update public.products
    set categories = coalesce(new_categories, '{}'::text[])
    where license_no = target_license_no;

  if not found then
    raise exception 'product not found: %', target_license_no;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. 更新 is_approved（配方種類是否顯示）
-- ---------------------------------------------------------------------
create or replace function public.update_product_is_approved(
  target_license_no text,
  new_is_approved boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  update public.products
    set is_approved = new_is_approved
    where license_no = target_license_no;

  if not found then
    raise exception 'product not found: %', target_license_no;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 4. 更新 product_status（含 enum check）
--   注意：當 nutrition_facts 為空時，UI 會 disable 編輯，但伺服器端
--   也加保險—如果產品還沒有 nutrition_facts，拒絕更新狀態。
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

  -- 1) 產品必須存在
  if not exists (
    select 1 from public.products p
    where p.license_no = target_license_no
  ) then
    raise exception 'product not found: %', target_license_no;
  end if;

  -- 2) nutrition_facts 不可為空（為空時 UI 會顯示「待處理」、不允許改狀態）
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


-- ---------------------------------------------------------------------
-- 5. 授權：只有 authenticated 可以呼叫，admin check 在 function 內
-- ---------------------------------------------------------------------
revoke all on function public.assert_caller_is_admin() from public;
revoke all on function public.get_admin_product_list() from public;
revoke all on function public.update_product_categories(text, text[]) from public;
revoke all on function public.update_product_is_approved(text, boolean) from public;
revoke all on function public.update_product_status(text, text) from public;

grant execute on function public.get_admin_product_list() to authenticated;
grant execute on function public.update_product_categories(text, text[]) to authenticated;
grant execute on function public.update_product_is_approved(text, boolean) to authenticated;
grant execute on function public.update_product_status(text, text) to authenticated;
