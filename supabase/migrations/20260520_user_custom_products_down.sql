-- =====================================================================
-- DOWN MIGRATION: User Custom Products
-- Created: 2026-05-20
-- =====================================================================

drop policy if exists "user_custom_variants_delete_own" on public.user_custom_variants;
drop policy if exists "user_custom_variants_update_own" on public.user_custom_variants;
drop policy if exists "user_custom_variants_insert_own" on public.user_custom_variants;
drop policy if exists "user_custom_variants_select_own" on public.user_custom_variants;

drop policy if exists "user_custom_products_delete_own" on public.user_custom_products;
drop policy if exists "user_custom_products_update_own" on public.user_custom_products;
drop policy if exists "user_custom_products_insert_own" on public.user_custom_products;
drop policy if exists "user_custom_products_select_own" on public.user_custom_products;

drop trigger if exists user_custom_variants_set_updated_at on public.user_custom_variants;
drop trigger if exists user_custom_products_set_updated_at on public.user_custom_products;

drop table if exists public.user_custom_variants;
drop table if exists public.user_custom_products;
