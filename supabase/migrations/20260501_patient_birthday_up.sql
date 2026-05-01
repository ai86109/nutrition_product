-- =====================================================================
-- UP MIGRATION: Add birthday to patients, remove age from bio_info
-- Created: 2026-05-01
-- 說明：
--   1. patients 表加 birthday DATE 欄位（nullable，由前端在建立病人時填入）
--   2. 清除 patient_snapshots.bio_info 內的 age key（age 改由 birthday 推算，不再凍結存快照）
-- =====================================================================

-- 1. 在 patients 加 birthday 欄位（nullable，舊病人無法回填真實生日）
alter table public.patients
  add column birthday date;

-- 2. 清除現有 snapshot 的 bio_info.age（此 key 已不再使用）
update public.patient_snapshots
set bio_info = bio_info - 'age'
where bio_info ? 'age';
