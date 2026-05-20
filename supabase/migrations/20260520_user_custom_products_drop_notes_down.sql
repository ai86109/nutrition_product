-- =====================================================================
-- DOWN MIGRATION: Restore notes column on user_custom_products
-- Created: 2026-05-20
-- =====================================================================

alter table public.user_custom_products
  add column if not exists notes text;
