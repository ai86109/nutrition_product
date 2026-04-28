-- =====================================================================
-- DOWN MIGRATION: Remove gender column from patients
-- Created: 2026-04-27
-- =====================================================================

alter table public.patients
  drop constraint if exists patients_gender_check;

alter table public.patients
  drop column if exists gender;
