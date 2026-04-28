-- =====================================================================
-- UP MIGRATION: Add gender column to patients
-- Created: 2026-04-27
-- 說明：
--   把 gender 從 snapshot 升級成 patient 的固有屬性。
--   流程：先加 nullable 欄位 → 從每位病人最新 snapshot 回填
--         → 處理沒有 snapshot 的邊界 case → 設 NOT NULL + check constraint
--   現有 snapshot 的 bio_info.gender 保留不動（snapshot 視為時間點凍結資料）。
-- =====================================================================

-- Step 1: 先加 nullable 欄位
alter table public.patients
  add column gender text;

-- Step 2: 從每位病人最新 snapshot 的 bio_info.gender 回填
update public.patients p
set gender = sub.gender
from (
  select distinct on (patient_id)
    patient_id,
    bio_info->>'gender' as gender
  from public.patient_snapshots
  order by patient_id, created_at desc
) sub
where p.id = sub.patient_id
  and sub.gender in ('man', 'woman');

-- Step 3: 任何尚未填值（沒 snapshot 或 snapshot 中性別異常）的病人，預設 'man'
update public.patients
set gender = 'man'
where gender is null;

-- Step 4: 設成 NOT NULL + check constraint
alter table public.patients
  alter column gender set not null,
  add constraint patients_gender_check check (gender in ('man', 'woman'));
