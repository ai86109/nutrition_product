-- =====================================================================
-- UP MIGRATION: Allow editing patient_snapshots.notes
-- Created: 2026-04-27
-- 說明：
--   原本 snapshot 完全不可編輯（DB 沒有 UPDATE policy）。
--   為支援「備註可編輯」功能，新增一條 UPDATE policy。
--   注意：Postgres RLS policy 無法用 column-level 限制，
--   所以這條 policy 技術上允許 update 任何欄位；
--   應用層必須由 mutation 自我約束只更新 notes。
-- =====================================================================

create policy "patient_snapshots_update_own"
  on public.patient_snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
