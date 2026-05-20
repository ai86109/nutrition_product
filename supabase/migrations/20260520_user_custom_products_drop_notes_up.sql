-- =====================================================================
-- UP MIGRATION: Drop notes column from user_custom_products
-- Created: 2026-05-20
-- 說明：
--   Derek 在 P1 上完之後決定不開放使用者寫 notes（避免額外維護負擔，
--   也讓 import/export schema 更精簡）。原本 notes 欄位允許 NULL，
--   未產生任何資料，可直接 drop。
--
--   注意：此 migration 必須在 20260520_user_custom_products_up.sql
--   之後執行（後者已建立 notes 欄位）。
-- =====================================================================

alter table public.user_custom_products
  drop column if exists notes;
