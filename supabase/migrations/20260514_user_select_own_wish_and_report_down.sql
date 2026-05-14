-- =====================================================================
-- DOWN MIGRATION: 移除使用者讀自己的 wishes / product_reports policy
-- Created: 2026-05-14
-- =====================================================================

drop policy if exists "product_reports_select_own" on public.product_reports;
drop policy if exists "wishes_select_own" on public.wishes;
