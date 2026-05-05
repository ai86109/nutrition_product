-- =====================================================================
-- DOWN MIGRATION: Snapshot calorie range
-- Created: 2026-05-05
-- 說明：
--   還原為 numeric 單欄位 calorie_target。
--   ⚠️ 若 min ≠ max（區間制下使用者輸入的真實區間），還原時會損失 max
--   資訊：取 min 當作單一目標值。
-- =====================================================================

-- 1. 新增回 calorie_target 欄位
alter table public.patient_snapshots
  add column calorie_target numeric null;

-- 2. Backfill：取 min 還原為單一目標值
update public.patient_snapshots
  set calorie_target = (calorie_range->>'min')::numeric
  where calorie_range is not null
    and (calorie_range->>'min') is not null;

-- 3. 移除新欄位
alter table public.patient_snapshots
  drop column calorie_range;
