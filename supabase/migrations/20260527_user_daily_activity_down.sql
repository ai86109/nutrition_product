-- =====================================================================
-- DOWN MIGRATION: user_daily_activity
-- Created: 2026-05-27
-- =====================================================================

drop function if exists public.record_user_activity();
drop table if exists public.user_daily_activity;
