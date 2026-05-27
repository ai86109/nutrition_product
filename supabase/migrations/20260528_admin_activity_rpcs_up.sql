-- =====================================================================
-- UP MIGRATION: admin 使用分析 RPCs
-- Created: 2026-05-28
-- 說明：
--   讀 user_daily_activity 給 admin 看 DAU 與個別使用者使用時間。
--   全部 SECURITY DEFINER + assert_caller_is_admin()。
--
--   一律排除 role='admin' 的使用者（不污染統計，admin 自己測試
--   不會被計入）。
--
--   時區：所有 date 比較都以 Asia/Taipei 為準，與 record_user_activity
--   寫入時保持一致。
--
--   範圍 p_days：呼叫端會帶 7 / 30 / 90；SQL 不強制驗證，呼叫端
--   負責白名單。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. admin_get_activity_summary：大盤 4 個數字
--    - today_dau：今日活躍人數（不受 p_days 影響，永遠是今天）
--    - avg_dau_in_range：範圍內每日 DAU 的平均（分母 = p_days）
--    - total_active_users：範圍內活躍使用者去重數
--    - avg_active_days_per_user：範圍內每位活躍使用者的平均活躍天數
-- ---------------------------------------------------------------------
create or replace function public.admin_get_activity_summary(
  p_days int default 30
)
returns table (
  today_dau                 int,
  avg_dau_in_range          numeric(10,1),
  total_active_users        int,
  avg_active_days_per_user  numeric(10,1)
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_today       date := (now() at time zone 'Asia/Taipei')::date;
  v_start_range date := (now() at time zone 'Asia/Taipei')::date - (p_days - 1);
begin
  perform public.assert_caller_is_admin();

  return query
  with activity_no_admin as (
    select uda.user_id, uda.date
    from public.user_daily_activity uda
    where not exists (
      select 1 from public.user_roles ur
      where ur.user_id = uda.user_id and ur.role = 'admin'
    )
  )
  select
    -- 今日 DAU
    (select count(distinct user_id)::int
     from activity_no_admin
     where date = v_today),

    -- 範圍內每日 DAU 平均
    coalesce((
      select (sum(daily.dau)::numeric / p_days)::numeric(10,1)
      from (
        select count(distinct user_id) as dau
        from activity_no_admin
        where date >= v_start_range
        group by date
      ) daily
    ), 0)::numeric(10,1),

    -- 範圍內活躍人數（去重）
    (select count(distinct user_id)::int
     from activity_no_admin
     where date >= v_start_range),

    -- 範圍內平均每人活躍天數
    coalesce((
      select avg(days)::numeric(10,1)
      from (
        select count(distinct date) as days
        from activity_no_admin
        where date >= v_start_range
        group by user_id
      ) per_user
    ), 0)::numeric(10,1);
end;
$$;


-- ---------------------------------------------------------------------
-- 2. admin_get_dau_series：DAU 折線圖資料
--    用 generate_series 補齊範圍內所有日期，0 活躍日也會出現在結果。
-- ---------------------------------------------------------------------
create or replace function public.admin_get_dau_series(
  p_days int default 30
)
returns table (
  date date,
  dau  int
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_today       date := (now() at time zone 'Asia/Taipei')::date;
  v_start_range date := (now() at time zone 'Asia/Taipei')::date - (p_days - 1);
begin
  perform public.assert_caller_is_admin();

  return query
  with
    date_range as (
      select generate_series(v_start_range, v_today, '1 day'::interval)::date as date
    ),
    activity_no_admin as (
      select uda.user_id, uda.date
      from public.user_daily_activity uda
      where uda.date >= v_start_range
        and not exists (
          select 1 from public.user_roles ur
          where ur.user_id = uda.user_id and ur.role = 'admin'
        )
    )
  select
    dr.date,
    count(distinct ana.user_id)::int as dau
  from date_range dr
  left join activity_no_admin ana on ana.date = dr.date
  group by dr.date
  order by dr.date;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. admin_list_user_activity：個別使用者統計
--    - active_days：範圍內活躍天數
--    - total_hit_count：範圍內 hit_count 總和
--    - estimated_minutes：等於 total_hit_count（heartbeat 與 throttle
--                        對齊都是 1 分鐘，所以 1 hit ≈ 1 活躍分鐘）
--    - last_active_date：範圍內最後活躍日
--    只回傳「範圍內有活動」的使用者；想看完全沒回來的使用者要另外
--    查 auth.users LEFT JOIN user_daily_activity（之後想做 churn 報表
--    再加一支 RPC）。
-- ---------------------------------------------------------------------
create or replace function public.admin_list_user_activity(
  p_days int default 30
)
returns table (
  user_id            uuid,
  email              text,
  name               text,
  avatar_url         text,
  active_days        int,
  total_hit_count    int,
  estimated_minutes  int,
  last_active_date   date
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_start_range date := (now() at time zone 'Asia/Taipei')::date - (p_days - 1);
begin
  perform public.assert_caller_is_admin();

  return query
  select
    uda.user_id,
    u.email::text                                           as email,
    coalesce(
      (u.raw_user_meta_data ->> 'full_name')::text,
      (u.raw_user_meta_data ->> 'name')::text,
      (u.raw_user_meta_data ->> 'user_name')::text
    )                                                       as name,
    (u.raw_user_meta_data ->> 'avatar_url')::text           as avatar_url,
    count(distinct uda.date)::int                           as active_days,
    sum(uda.hit_count)::int                                 as total_hit_count,
    sum(uda.hit_count)::int                                 as estimated_minutes,
    max(uda.date)                                           as last_active_date
  from public.user_daily_activity uda
  join auth.users u on u.id = uda.user_id
  where uda.date >= v_start_range
    and not exists (
      select 1 from public.user_roles ur
      where ur.user_id = uda.user_id and ur.role = 'admin'
    )
  group by uda.user_id, u.email, u.raw_user_meta_data
  order by sum(uda.hit_count) desc;
end;
$$;


-- ---------------------------------------------------------------------
-- 4. 授權
-- ---------------------------------------------------------------------
revoke all on function public.admin_get_activity_summary(int) from public;
revoke all on function public.admin_get_dau_series(int)        from public;
revoke all on function public.admin_list_user_activity(int)    from public;

grant execute on function public.admin_get_activity_summary(int) to authenticated;
grant execute on function public.admin_get_dau_series(int)        to authenticated;
grant execute on function public.admin_list_user_activity(int)    to authenticated;
