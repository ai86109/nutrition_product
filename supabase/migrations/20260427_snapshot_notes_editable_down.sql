-- =====================================================================
-- DOWN MIGRATION: Remove patient_snapshots UPDATE policy
-- Created: 2026-04-27
-- =====================================================================

drop policy if exists "patient_snapshots_update_own" on public.patient_snapshots;
