-- =====================================================================
-- UP MIGRATION: User note templates
-- Created: 2026-05-06
-- 說明：
--   為 user_preferences 加上 note_templates jsonb 欄位，存使用者
--   自訂的 snapshot 備註模板清單。
--   形狀（jsonb 陣列）：
--     [{ id, title, content, sort_order }, ...]
-- =====================================================================

alter table public.user_preferences
  add column note_templates jsonb null;
