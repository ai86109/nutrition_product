-- =====================================================================
-- UP MIGRATION: Wish pool
-- Created: 2026-05-07
-- 說明：
--   許願池功能。登入使用者可以送出想要的功能 / 改善建議，admin 後台
--   會列出所有 wish 並追蹤進度（planned / in-progress / completed）。
--
--   - 一般使用者：只能 insert 自己的 wish；不開 select / update policy。
--     送出後就不會在 client 端再被讀回（MVP 不做「我的許願」清單）。
--   - admin：透過 SECURITY DEFINER RPC 讀寫，函式內呼叫
--     assert_caller_is_admin()。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. wish_status enum
-- ---------------------------------------------------------------------
create type public.wish_status as enum ('planned', 'in-progress', 'completed');


-- ---------------------------------------------------------------------
-- 2. wishes 表
-- ---------------------------------------------------------------------
create table public.wishes (
  id          uuid                primary key default gen_random_uuid(),
  user_id     uuid                references auth.users(id) on delete set null,
  content     text                not null,
  status      public.wish_status  not null default 'planned',
  admin_note  text,
  created_at  timestamptz         not null default now(),
  updated_at  timestamptz         not null default now(),

  constraint wishes_content_not_empty
    check (char_length(trim(content)) between 1 and 1000)
);

create index idx_wishes_status     on public.wishes(status);
create index idx_wishes_created_at on public.wishes(created_at desc);
create index idx_wishes_user_id    on public.wishes(user_id);

create trigger wishes_set_updated_at
  before update on public.wishes
  for each row
  execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 3. Row Level Security
--   只開 INSERT；SELECT / UPDATE / DELETE 都不開 policy，client 走不到，
--   讀寫一律經過 admin RPC。
-- ---------------------------------------------------------------------
alter table public.wishes enable row level security;

create policy "wishes_insert_own"
  on public.wishes for insert
  to authenticated
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 4. Admin RPC：list_wishes
--   回傳所有 wish，附上許願者的 email（join auth.users）。
--   p_status：可選，不傳就回全部。
-- ---------------------------------------------------------------------
create or replace function public.list_wishes(
  p_status public.wish_status default null
)
returns table (
  id          uuid,
  user_id     uuid,
  user_email  text,
  content     text,
  status      public.wish_status,
  admin_note  text,
  created_at  timestamptz,
  updated_at  timestamptz
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
    w.updated_at
  from public.wishes w
  left join auth.users u on u.id = w.user_id
  where p_status is null or w.status = p_status
  order by w.created_at desc;
end;
$$;


-- ---------------------------------------------------------------------
-- 5. Admin RPC：update_wish_status（同時可寫 admin_note）
-- ---------------------------------------------------------------------
create or replace function public.update_wish_status(
  p_id          uuid,
  p_status      public.wish_status,
  p_admin_note  text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  update public.wishes
    set status     = p_status,
        admin_note = p_admin_note
    where id = p_id;

  if not found then
    raise exception 'wish not found: %', p_id;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 6. 授權
-- ---------------------------------------------------------------------
revoke all on function public.list_wishes(public.wish_status) from public;
revoke all on function public.update_wish_status(uuid, public.wish_status, text) from public;

grant execute on function public.list_wishes(public.wish_status) to authenticated;
grant execute on function public.update_wish_status(uuid, public.wish_status, text) to authenticated;
