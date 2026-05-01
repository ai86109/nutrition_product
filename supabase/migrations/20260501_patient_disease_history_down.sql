-- =====================================================================
-- DOWN MIGRATION: Remove disease_history from patients
-- Created: 2026-05-01
-- =====================================================================

alter table public.patients
  drop column if exists disease_history;
