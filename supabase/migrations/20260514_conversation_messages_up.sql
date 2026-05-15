-- =====================================================================
-- UP MIGRATION: 對話訊息（許願池 / 錯誤回報共用）
-- Created: 2026-05-14
-- 說明：
--   讓 admin 與 user 可以在「許願」與「錯誤回報」這兩個 ticket 上互傳
--   訊息（類似客服對話）。許願與回報的訊息共用同一張表，靠 wish_id /
--   report_id 二擇一的 nullable FK 區分，CHECK 確保只屬於一個對話。
--
--   業務規則：
--     - 只有 status in ('planned','in-progress') 才能寫訊息；'completed'
--       一旦進入，雙方都不能再寫，舊訊息仍可讀。
--     - 已讀採「指針」設計：在 wishes / product_reports 各加
--       last_read_by_user_at / last_read_by_admin_at，未讀數 = 對方寫的、
--       且 created_at > 我的指針 的訊息數。
--     - User 走一般 RLS（SELECT/INSERT 自己擁有的對話）；
--       Admin 全走 SECURITY DEFINER RPC（與既有 admin RPC 風格一致）。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. wishes / product_reports 加已讀指針
-- ---------------------------------------------------------------------
alter table public.wishes
  add column if not exists last_read_by_user_at  timestamptz,
  add column if not exists last_read_by_admin_at timestamptz;

alter table public.product_reports
  add column if not exists last_read_by_user_at  timestamptz,
  add column if not exists last_read_by_admin_at timestamptz;


-- ---------------------------------------------------------------------
-- 2. conversation_sender_role enum
-- ---------------------------------------------------------------------
create type public.conversation_sender_role as enum ('user', 'admin');


-- ---------------------------------------------------------------------
-- 3. conversation_messages 表
-- ---------------------------------------------------------------------
create table public.conversation_messages (
  id           uuid                              primary key default gen_random_uuid(),
  wish_id      uuid                              references public.wishes(id)          on delete cascade,
  report_id    uuid                              references public.product_reports(id) on delete cascade,
  sender_id    uuid                              references auth.users(id)             on delete set null,
  sender_role  public.conversation_sender_role  not null,
  content      text                              not null,
  created_at   timestamptz                       not null default now(),

  -- 二擇一：必須屬於 wish 或 report 其中一個，不能同時、不能都 null
  constraint conversation_messages_one_target
    check ((wish_id is null) <> (report_id is null)),

  constraint conversation_messages_content_length
    check (char_length(trim(content)) between 1 and 1000)
);

create index idx_conversation_messages_wish_id_created
  on public.conversation_messages(wish_id, created_at) where wish_id is not null;

create index idx_conversation_messages_report_id_created
  on public.conversation_messages(report_id, created_at) where report_id is not null;


-- ---------------------------------------------------------------------
-- 4. Row Level Security（user 端）
--   admin 不靠 RLS 讀寫，全走 SECURITY DEFINER RPC。
-- ---------------------------------------------------------------------
alter table public.conversation_messages enable row level security;

-- 4.1 SELECT：user 只能讀自己擁有的對話的訊息
create policy "conversation_messages_select_own_user"
  on public.conversation_messages for select
  to authenticated
  using (
    (
      wish_id is not null
      and exists (
        select 1 from public.wishes w
        where w.id = wish_id and w.user_id = auth.uid()
      )
    )
    or
    (
      report_id is not null
      and exists (
        select 1 from public.product_reports r
        where r.id = report_id and r.user_id = auth.uid()
      )
    )
  );

-- 4.2 INSERT：user 寫自己擁有的對話、role='user'、且對話狀態 in ('planned','in-progress')
create policy "conversation_messages_insert_own_user"
  on public.conversation_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and sender_role = 'user'
    and (
      (
        wish_id is not null
        and exists (
          select 1 from public.wishes w
          where w.id = wish_id
            and w.user_id = auth.uid()
            and w.status in ('planned', 'in-progress')
        )
      )
      or
      (
        report_id is not null
        and exists (
          select 1 from public.product_reports r
          where r.id = report_id
            and r.user_id = auth.uid()
            and r.status in ('planned', 'in-progress')
        )
      )
    )
  );


-- ---------------------------------------------------------------------
-- 5. RPC：mark_conversation_read（user / admin 共用）
--   p_kind: 'wish' | 'report'
--   - user 端：函式內檢查呼叫者擁有該對話，更新 last_read_by_user_at
--   - admin 端：透過 assert_caller_is_admin()，更新 last_read_by_admin_at
--   為了單一函式對外，內部依 caller 角色判斷要更新哪個欄位。
-- ---------------------------------------------------------------------
create or replace function public.mark_conversation_read(
  p_kind text,
  p_id   uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean := public.is_caller_admin();
  v_owner_id uuid;
begin
  if p_kind not in ('wish', 'report') then
    raise exception 'invalid kind: %', p_kind;
  end if;

  if p_kind = 'wish' then
    select user_id into v_owner_id from public.wishes where id = p_id;
  else
    select user_id into v_owner_id from public.product_reports where id = p_id;
  end if;

  if v_owner_id is null and not v_is_admin then
    raise exception 'conversation not found or not accessible';
  end if;

  -- admin：標 admin 那條指針
  if v_is_admin then
    if p_kind = 'wish' then
      update public.wishes set last_read_by_admin_at = now() where id = p_id;
    else
      update public.product_reports set last_read_by_admin_at = now() where id = p_id;
    end if;
    return;
  end if;

  -- user：必須是 owner
  if v_owner_id <> auth.uid() then
    raise exception 'not owner of conversation';
  end if;

  if p_kind = 'wish' then
    update public.wishes set last_read_by_user_at = now() where id = p_id;
  else
    update public.product_reports set last_read_by_user_at = now() where id = p_id;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 6. RPC：is_caller_admin（純讀；mark_conversation_read 用）
--   既有的 assert_caller_is_admin 會 raise；這裡需要 boolean。
-- ---------------------------------------------------------------------
create or replace function public.is_caller_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;


-- ---------------------------------------------------------------------
-- 7. Admin RPC：list_conversation_messages_admin
--   讓 admin 讀任何對話的訊息（含寄件者 email）。
-- ---------------------------------------------------------------------
create or replace function public.list_conversation_messages_admin(
  p_kind text,
  p_id   uuid
)
returns table (
  id            uuid,
  sender_id     uuid,
  sender_email  text,
  sender_role   public.conversation_sender_role,
  content       text,
  created_at    timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.assert_caller_is_admin();

  if p_kind not in ('wish', 'report') then
    raise exception 'invalid kind: %', p_kind;
  end if;

  return query
  select
    cm.id,
    cm.sender_id,
    u.email::text as sender_email,
    cm.sender_role,
    cm.content,
    cm.created_at
  from public.conversation_messages cm
  left join auth.users u on u.id = cm.sender_id
  where (p_kind = 'wish'   and cm.wish_id   = p_id)
     or (p_kind = 'report' and cm.report_id = p_id)
  order by cm.created_at asc;
end;
$$;


-- ---------------------------------------------------------------------
-- 8. Admin RPC：insert_conversation_message_admin
--   admin 在對話中寫一則訊息。內部檢查對話狀態 != 'completed'。
-- ---------------------------------------------------------------------
create or replace function public.insert_conversation_message_admin(
  p_kind    text,
  p_id      uuid,
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_new_id uuid;
begin
  perform public.assert_caller_is_admin();

  if p_kind not in ('wish', 'report') then
    raise exception 'invalid kind: %', p_kind;
  end if;

  if p_kind = 'wish' then
    select status::text into v_status from public.wishes where id = p_id;
  else
    select status::text into v_status from public.product_reports where id = p_id;
  end if;

  if v_status is null then
    raise exception 'conversation target not found';
  end if;

  if v_status = 'completed' then
    raise exception 'conversation is completed; messaging disabled';
  end if;

  insert into public.conversation_messages (
    wish_id, report_id, sender_id, sender_role, content
  ) values (
    case when p_kind = 'wish'   then p_id else null end,
    case when p_kind = 'report' then p_id else null end,
    auth.uid(),
    'admin',
    p_content
  )
  returning id into v_new_id;

  return v_new_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 9. RPC：list_my_wishes（含 unread_count）
--   給個人中心使用。SECURITY INVOKER，靠既有 wishes_select_own RLS 過濾。
--   unread_count = admin 寫的、且 created_at > last_read_by_user_at 的訊息數。
-- ---------------------------------------------------------------------
create or replace function public.list_my_wishes()
returns table (
  id            uuid,
  user_id       uuid,
  content       text,
  status        public.wish_status,
  admin_note    text,
  created_at    timestamptz,
  updated_at    timestamptz,
  unread_count  integer
)
language sql
security invoker
set search_path = public
stable
as $$
  select
    w.id,
    w.user_id,
    w.content,
    w.status,
    w.admin_note,
    w.created_at,
    w.updated_at,
    coalesce((
      select count(*)::int from public.conversation_messages cm
      where cm.wish_id = w.id
        and cm.sender_role = 'admin'
        and (w.last_read_by_user_at is null or cm.created_at > w.last_read_by_user_at)
    ), 0) as unread_count
  from public.wishes w
  where w.user_id = auth.uid()
  order by w.created_at desc;
$$;


-- ---------------------------------------------------------------------
-- 10. RPC：list_my_product_reports（含 unread_count + 產品名）
-- ---------------------------------------------------------------------
create or replace function public.list_my_product_reports()
returns table (
  id              uuid,
  product_id      text,
  product_name    text,
  user_id         uuid,
  reporter_name   text,
  category        public.product_report_category,
  description     text,
  status          public.product_report_status,
  admin_note      text,
  created_at      timestamptz,
  updated_at      timestamptz,
  unread_count    integer
)
language sql
security invoker
set search_path = public
stable
as $$
  select
    r.id,
    r.product_id,
    p.name_zh::text as product_name,
    r.user_id,
    r.reporter_name,
    r.category,
    r.description,
    r.status,
    r.admin_note,
    r.created_at,
    r.updated_at,
    coalesce((
      select count(*)::int from public.conversation_messages cm
      where cm.report_id = r.id
        and cm.sender_role = 'admin'
        and (r.last_read_by_user_at is null or cm.created_at > r.last_read_by_user_at)
    ), 0) as unread_count
  from public.product_reports r
  left join public.products p on p.license_no = r.product_id
  where r.user_id = auth.uid()
  order by r.created_at desc;
$$;


-- ---------------------------------------------------------------------
-- 11. 改寫既有 list_wishes / list_product_reports 加 unread_count
--   admin 端 unread = user 寫的、且 created_at > last_read_by_admin_at 的訊息數。
--   函式簽名（參數 + 回傳欄位）改變，必須先 DROP 再 CREATE。
-- ---------------------------------------------------------------------
drop function if exists public.list_wishes(public.wish_status);

create or replace function public.list_wishes(
  p_status public.wish_status default null
)
returns table (
  id            uuid,
  user_id       uuid,
  user_email    text,
  content       text,
  status        public.wish_status,
  admin_note    text,
  created_at    timestamptz,
  updated_at    timestamptz,
  unread_count  integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.assert_caller_is_admin();

  return query
  select
    w.id,
    w.user_id,
    u.email::text as user_email,
    w.content,
    w.status,
    w.admin_note,
    w.created_at,
    w.updated_at,
    coalesce((
      select count(*)::int from public.conversation_messages cm
      where cm.wish_id = w.id
        and cm.sender_role = 'user'
        and (w.last_read_by_admin_at is null or cm.created_at > w.last_read_by_admin_at)
    ), 0) as unread_count
  from public.wishes w
  left join auth.users u on u.id = w.user_id
  where p_status is null or w.status = p_status
  order by w.created_at desc;
end;
$$;


drop function if exists public.list_product_reports(public.product_report_status);

create or replace function public.list_product_reports(
  p_status public.product_report_status default null
)
returns table (
  id              uuid,
  product_id      text,
  product_name    text,
  user_id         uuid,
  user_email      text,
  reporter_name   text,
  category        public.product_report_category,
  description     text,
  status          public.product_report_status,
  admin_note      text,
  created_at      timestamptz,
  updated_at      timestamptz,
  unread_count    integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.assert_caller_is_admin();

  return query
  select
    r.id,
    r.product_id,
    p.name_zh::text as product_name,
    r.user_id,
    u.email::text as user_email,
    r.reporter_name,
    r.category,
    r.description,
    r.status,
    r.admin_note,
    r.created_at,
    r.updated_at,
    coalesce((
      select count(*)::int from public.conversation_messages cm
      where cm.report_id = r.id
        and cm.sender_role = 'user'
        and (r.last_read_by_admin_at is null or cm.created_at > r.last_read_by_admin_at)
    ), 0) as unread_count
  from public.product_reports r
  left join public.products p on p.license_no = r.product_id
  left join auth.users u on u.id = r.user_id
  where p_status is null or r.status = p_status
  order by r.created_at desc;
end;
$$;


-- ---------------------------------------------------------------------
-- 12. RPC：get_my_total_unread_count / get_admin_total_unread_count
--   給 nav bar 顯示紅點。
-- ---------------------------------------------------------------------
create or replace function public.get_my_total_unread_count()
returns integer
language sql
security invoker
set search_path = public
stable
as $$
  select coalesce(sum(c), 0)::int from (
    select count(*) as c
    from public.conversation_messages cm
    join public.wishes w on w.id = cm.wish_id
    where cm.sender_role = 'admin'
      and w.user_id = auth.uid()
      and (w.last_read_by_user_at is null or cm.created_at > w.last_read_by_user_at)
    union all
    select count(*) as c
    from public.conversation_messages cm
    join public.product_reports r on r.id = cm.report_id
    where cm.sender_role = 'admin'
      and r.user_id = auth.uid()
      and (r.last_read_by_user_at is null or cm.created_at > r.last_read_by_user_at)
  ) t;
$$;


create or replace function public.get_admin_total_unread_count()
returns integer
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_count integer;
begin
  perform public.assert_caller_is_admin();

  select coalesce(sum(c), 0)::int into v_count from (
    select count(*) as c
    from public.conversation_messages cm
    join public.wishes w on w.id = cm.wish_id
    where cm.sender_role = 'user'
      and (w.last_read_by_admin_at is null or cm.created_at > w.last_read_by_admin_at)
    union all
    select count(*) as c
    from public.conversation_messages cm
    join public.product_reports r on r.id = cm.report_id
    where cm.sender_role = 'user'
      and (r.last_read_by_admin_at is null or cm.created_at > r.last_read_by_admin_at)
  ) t;

  return v_count;
end;
$$;


-- ---------------------------------------------------------------------
-- 13. 授權
-- ---------------------------------------------------------------------
revoke all on function public.mark_conversation_read(text, uuid) from public;
revoke all on function public.is_caller_admin() from public;
revoke all on function public.list_conversation_messages_admin(text, uuid) from public;
revoke all on function public.insert_conversation_message_admin(text, uuid, text) from public;
revoke all on function public.list_my_wishes() from public;
revoke all on function public.list_my_product_reports() from public;
revoke all on function public.get_my_total_unread_count() from public;
revoke all on function public.get_admin_total_unread_count() from public;

grant execute on function public.mark_conversation_read(text, uuid) to authenticated;
grant execute on function public.is_caller_admin() to authenticated;
grant execute on function public.list_conversation_messages_admin(text, uuid) to authenticated;
grant execute on function public.insert_conversation_message_admin(text, uuid, text) to authenticated;
grant execute on function public.list_my_wishes() to authenticated;
grant execute on function public.list_my_product_reports() to authenticated;
grant execute on function public.get_my_total_unread_count() to authenticated;
grant execute on function public.get_admin_total_unread_count() to authenticated;

grant execute on function public.list_wishes(public.wish_status) to authenticated;
grant execute on function public.list_product_reports(public.product_report_status) to authenticated;
