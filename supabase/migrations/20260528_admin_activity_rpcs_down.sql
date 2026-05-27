-- =====================================================================
-- DOWN MIGRATION: admin 使用分析 RPCs
-- Created: 2026-05-28
-- =====================================================================

drop function if exists public.admin_list_user_activity(int);
drop function if exists public.admin_get_dau_series(int);
drop function if exists public.admin_get_activity_summary(int);
