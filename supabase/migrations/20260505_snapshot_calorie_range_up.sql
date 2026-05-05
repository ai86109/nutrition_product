-- =====================================================================
-- UP MIGRATION: Snapshot calorie range
-- Created: 2026-05-05
-- 說明：
--   把 patient_snapshots.calorie_target (numeric, 單一目標值) 改成
--   calorie_range (jsonb, { min, max })，與 protein_range 形狀一致。
--   舊資料 N 視為 min == max == N（原本就是單一目標值，等同區間退化）。
-- =====================================================================

-- 1. 新增 calorie_range 欄位
alter table public.patient_snapshots
  add column calorie_range jsonb null;

-- 2. Backfill：把舊的單一目標值塞成 { min: N, max: N }
update public.patient_snapshots
  set calorie_range = jsonb_build_object('min', calorie_target, 'max', calorie_target)
  where calorie_target is not null;

-- 3. 移除舊欄位
alter table public.patient_snapshots
  drop column calorie_target;
