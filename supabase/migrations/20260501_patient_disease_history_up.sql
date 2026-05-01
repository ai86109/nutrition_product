-- =====================================================================
-- UP MIGRATION: Add disease_history to patients
-- Created: 2026-05-01
-- =====================================================================

alter table public.patients
  add column disease_history text;
