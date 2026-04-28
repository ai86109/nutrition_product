-- =====================================================================
-- DOWN MIGRATION: Patient Tracking (rollback)
-- Created: 2026-04-27
-- 說明：
--   還原 up migration。drop table 會連帶清除 indexes / triggers / policies。
--   set_updated_at() 是通用 function，預設保留以免影響其他表；
--   若確認沒有其他地方使用，可手動 drop（最後一行已註解）。
-- =====================================================================

drop table if exists public.patient_snapshots cascade;
drop table if exists public.patients          cascade;

-- drop function if exists public.set_updated_at();
