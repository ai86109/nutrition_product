-- =====================================================================
-- DOWN MIGRATION: Remove admin product management RPCs
-- Created: 2026-04-29
-- 還原 20260429_admin_products_rpcs_up.sql
-- 注意：assert_caller_is_admin() 是這次新增的內部 helper，沒有其他
--       已知的呼叫者，因此一併 drop。如果未來有其他 RPC 也用到它，
--       要先確認再執行這段 down migration。
-- =====================================================================

drop function if exists public.update_product_status(text, text);
drop function if exists public.update_product_is_approved(text, boolean);
drop function if exists public.update_product_categories(text, text[]);
drop function if exists public.get_admin_product_list();
drop function if exists public.assert_caller_is_admin();
