-- =====================================================================
-- DOWN MIGRATION: Remove birthday from patients
-- Created: 2026-05-01
-- 說明：
--   還原 20260501_patient_birthday_up.sql 的變更。
--   注意：bio_info.age 的資料已無法還原（已清除），down migration 不補回。
-- =====================================================================

alter table public.patients
  drop column if exists birthday;
