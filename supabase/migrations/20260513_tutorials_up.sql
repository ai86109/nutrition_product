-- =====================================================================
-- UP MIGRATION: Tutorials
-- Created: 2026-05-13
-- 說明：
--   「新手上路」教學列表。Admin 可在後台 CRUD + 排序 + 切換上下架。
--
--   - 公開（anon + authenticated）：只能讀取 is_published = true 的 row
--   - admin：透過 SECURITY DEFINER RPC 讀寫，函式內呼叫
--     assert_caller_is_admin()
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. tutorials 表
-- ---------------------------------------------------------------------
create table public.tutorials (
  id            uuid         primary key default gen_random_uuid(),
  title         text         not null,
  description   text         not null default '',
  href          text         not null,
  sort_order    int          not null default 0,
  is_published  boolean      not null default true,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),

  constraint tutorials_title_not_empty
    check (char_length(trim(title)) between 1 and 200),
  constraint tutorials_href_not_empty
    check (char_length(trim(href)) between 1 and 2000),
  constraint tutorials_description_max
    check (char_length(description) <= 1000)
);

create index idx_tutorials_published_order
  on public.tutorials(is_published, sort_order, created_at);

create trigger tutorials_set_updated_at
  before update on public.tutorials
  for each row
  execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 2. Row Level Security
--   公開讀取 is_published = true 的 row；其餘操作走 admin RPC。
-- ---------------------------------------------------------------------
alter table public.tutorials enable row level security;

create policy "tutorials_read_published"
  on public.tutorials for select
  to anon, authenticated
  using (is_published = true);


-- ---------------------------------------------------------------------
-- 3. Admin RPC：list_tutorials_admin
--   回傳所有 tutorial（含未發佈），依 sort_order asc, created_at asc。
-- ---------------------------------------------------------------------
create or replace function public.list_tutorials_admin()
returns setof public.tutorials
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.assert_caller_is_admin();

  return query
  select * from public.tutorials
  order by sort_order asc, created_at asc;
end;
$$;


-- ---------------------------------------------------------------------
-- 4. Admin RPC：create_tutorial
--   新增 tutorial，sort_order 自動 = 目前最大值 + 10（放在最下面）。
-- ---------------------------------------------------------------------
create or replace function public.create_tutorial(
  p_title         text,
  p_description   text,
  p_href          text,
  p_is_published  boolean default true
)
returns public.tutorials
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_order  int;
  v_row         public.tutorials;
begin
  perform public.assert_caller_is_admin();

  select coalesce(max(sort_order), 0) + 10
    into v_next_order
    from public.tutorials;

  insert into public.tutorials (title, description, href, sort_order, is_published)
  values (
    p_title,
    coalesce(p_description, ''),
    p_href,
    v_next_order,
    coalesce(p_is_published, true)
  )
  returning * into v_row;

  return v_row;
end;
$$;


-- ---------------------------------------------------------------------
-- 5. Admin RPC：update_tutorial
--   全欄位更新（caller 帶入該 row 完整內容）。
-- ---------------------------------------------------------------------
create or replace function public.update_tutorial(
  p_id            uuid,
  p_title         text,
  p_description   text,
  p_href          text,
  p_is_published  boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  update public.tutorials
    set title        = p_title,
        description  = coalesce(p_description, ''),
        href         = p_href,
        is_published = p_is_published
    where id = p_id;

  if not found then
    raise exception 'tutorial not found: %', p_id;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 6. Admin RPC：delete_tutorial
-- ---------------------------------------------------------------------
create or replace function public.delete_tutorial(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  delete from public.tutorials where id = p_id;

  if not found then
    raise exception 'tutorial not found: %', p_id;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 7. Admin RPC：swap_tutorial_order
--   交換指定 tutorial 與「相鄰一筆」的 sort_order，達到上移/下移效果。
--   p_direction: 'up' | 'down'
--   若已在最頂 / 最底，靜默回傳（不報錯）。
-- ---------------------------------------------------------------------
create or replace function public.swap_tutorial_order(
  p_id         uuid,
  p_direction  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curr_id          uuid;
  v_curr_sort_order  int;
  v_curr_created_at  timestamptz;
  v_other_id         uuid;
  v_other_sort_order int;
begin
  perform public.assert_caller_is_admin();

  if p_direction not in ('up', 'down') then
    raise exception 'invalid direction: %', p_direction;
  end if;

  select id, sort_order, created_at
    into v_curr_id, v_curr_sort_order, v_curr_created_at
    from public.tutorials
    where id = p_id;

  if not found then
    raise exception 'tutorial not found: %', p_id;
  end if;

  if p_direction = 'up' then
    select id, sort_order
      into v_other_id, v_other_sort_order
      from public.tutorials
      where (sort_order, created_at) < (v_curr_sort_order, v_curr_created_at)
      order by sort_order desc, created_at desc
      limit 1;
  else
    select id, sort_order
      into v_other_id, v_other_sort_order
      from public.tutorials
      where (sort_order, created_at) > (v_curr_sort_order, v_curr_created_at)
      order by sort_order asc, created_at asc
      limit 1;
  end if;

  -- 已到頂 / 底，沒有相鄰可交換
  if v_other_id is null then
    return;
  end if;

  -- 兩 row sort_order 相同時，僅靠 sort_order 互換無效；做 +1 / -1 微調保證可見差異
  if v_curr_sort_order = v_other_sort_order then
    if p_direction = 'up' then
      update public.tutorials set sort_order = v_curr_sort_order - 1 where id = v_other_id;
      update public.tutorials set sort_order = v_curr_sort_order     where id = v_curr_id; -- no-op，但觸發 updated_at
    else
      update public.tutorials set sort_order = v_curr_sort_order + 1 where id = v_other_id;
      update public.tutorials set sort_order = v_curr_sort_order     where id = v_curr_id;
    end if;
    return;
  end if;

  -- 一般情況：兩筆 sort_order 互換
  update public.tutorials set sort_order = v_curr_sort_order  where id = v_other_id;
  update public.tutorials set sort_order = v_other_sort_order where id = v_curr_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 8. 授權
-- ---------------------------------------------------------------------
revoke all on function public.list_tutorials_admin()                          from public;
revoke all on function public.create_tutorial(text, text, text, boolean)      from public;
revoke all on function public.update_tutorial(uuid, text, text, text, boolean) from public;
revoke all on function public.delete_tutorial(uuid)                           from public;
revoke all on function public.swap_tutorial_order(uuid, text)                 from public;

grant execute on function public.list_tutorials_admin()                          to authenticated;
grant execute on function public.create_tutorial(text, text, text, boolean)      to authenticated;
grant execute on function public.update_tutorial(uuid, text, text, text, boolean) to authenticated;
grant execute on function public.delete_tutorial(uuid)                           to authenticated;
grant execute on function public.swap_tutorial_order(uuid, text)                 to authenticated;
