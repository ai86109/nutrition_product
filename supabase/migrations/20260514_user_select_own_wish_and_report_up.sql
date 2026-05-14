-- =====================================================================
-- UP MIGRATION: 使用者讀自己的 wishes / product_reports
-- Created: 2026-05-14
-- 說明：
--   個人中心頁面（/profile）需要讓登入使用者看自己送出過的許願與
--   錯誤回報。先前的 wishes / product_reports migration 為了精簡 MVP，
--   只開了 INSERT policy；本 migration 補上 SELECT own policy。
--
--   - 走一般 RLS policy 而不是 SECURITY DEFINER RPC：使用者只讀自己的
--     列、不需要 join auth.users 取 email；product_reports 需要產品中文名
--     由前端透過 supabase 內嵌查詢 select('*, products(name_zh)') 取得，
--     products 表本來就是公開可讀，無安全顧慮。
--   - 不開 UPDATE / DELETE：使用者送出後不能改、不能刪。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. wishes：使用者可讀自己的許願
-- ---------------------------------------------------------------------
create policy "wishes_select_own"
  on public.wishes for select
  to authenticated
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 2. product_reports：使用者可讀自己的回報
--    （訪客 user_id 為 null 的不在此範圍）
-- ---------------------------------------------------------------------
create policy "product_reports_select_own"
  on public.product_reports for select
  to authenticated
  using (auth.uid() = user_id);
