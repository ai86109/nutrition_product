-- =====================================================================
-- DOWN MIGRATION: Patient Groups
-- Created: 2026-05-06
-- =====================================================================

drop policy if exists "patient_group_memberships_delete_own" on public.patient_group_memberships;
drop policy if exists "patient_group_memberships_insert_own" on public.patient_group_memberships;
drop policy if exists "patient_group_memberships_select_own" on public.patient_group_memberships;

drop policy if exists "patient_groups_delete_own" on public.patient_groups;
drop policy if exists "patient_groups_update_own" on public.patient_groups;
drop policy if exists "patient_groups_insert_own" on public.patient_groups;
drop policy if exists "patient_groups_select_own" on public.patient_groups;

drop trigger if exists patient_groups_set_updated_at on public.patient_groups;

drop table if exists public.patient_group_memberships;
drop table if exists public.patient_groups;
