-- =====================================================================
-- UP MIGRATION: user_daily_activity（使用者每日活躍紀錄）
-- Created: 2026-05-27
-- 說明：
--   後台目前只看得到 auth.users.last_sign_in_at，但 Supabase session
--   會自動續期，使用者一登入後可能很久不再走 OAuth，導致無法判斷他
--   是否真的有每天上線。本表用「每位使用者每天最多一筆」的設計來
--   記錄活躍狀況。
--
--   寫入路徑（雙重保險）：
--     1) src/middleware.ts 每個 page request 呼叫 record_user_activity()
--     2) src/hooks/useActivityHeartbeat.ts client 端 5 分鐘 + visibility-aware
--
--   record_user_activity() 內含 throttle：同一筆 row 在 1 分鐘內被
--   重複呼叫只會被 ON CONFLICT 攔下且 WHERE 為假，不會真的 UPDATE，
--   也不會報錯。所以 middleware + heartbeat 兩邊都打也安全。
--
--   日期以 Asia/Taipei 計算，避免 UTC 半夜跨日問題。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. user_daily_activity 表
--    PK = (user_id, date) 自然去重，不需額外 unique constraint。
--    hit_count 代表「該日相隔 >1 分鐘的活動次數」，約等於活躍 5 分鐘
--    區段數（搭配 heartbeat 間隔）。
-- ---------------------------------------------------------------------
create table public.user_daily_activity (
  user_id        uuid        not null references auth.users(id) on delete cascade,
  date           date        not null,
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  hit_count      integer     not null default 1,
  primary key (user_id, date)
);

create index idx_user_daily_activity_date
  on public.user_daily_activity(date desc);


-- ---------------------------------------------------------------------
-- 2. Row Level Security
--    使用者只能寫自己的、讀自己的（之後想做 streak/連續登入 UI 可直
--    接讀）。admin 端要查總體統計時走 SQL editor 或日後加 RPC，不靠
--    這層 RLS。
-- ---------------------------------------------------------------------
alter table public.user_daily_activity enable row level security;

create policy "user_daily_activity_select_own"
  on public.user_daily_activity for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_daily_activity_insert_own"
  on public.user_daily_activity for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_daily_activity_update_own"
  on public.user_daily_activity for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 3. RPC：record_user_activity
--    讓 client / middleware 透過單一 RPC 呼叫即可記錄，不需自己組
--    upsert。throttle 也包在這層 SQL 裡。
--
--    SECURITY INVOKER：完全靠 RLS 與 auth.uid() 把關，沒有越權風險。
-- ---------------------------------------------------------------------
create or replace function public.record_user_activity()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  insert into public.user_daily_activity (user_id, date)
  values (
    auth.uid(),
    (now() at time zone 'Asia/Taipei')::date
  )
  on conflict (user_id, date) do update
    set last_seen_at = now(),
        hit_count    = public.user_daily_activity.hit_count + 1
    where public.user_daily_activity.last_seen_at < now() - interval '1 minute';
end;
$$;


-- ---------------------------------------------------------------------
-- 4. 授權
-- ---------------------------------------------------------------------
revoke all on function public.record_user_activity() from public;
grant execute on function public.record_user_activity() to authenticated;
