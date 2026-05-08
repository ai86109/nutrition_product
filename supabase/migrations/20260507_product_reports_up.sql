-- =====================================================================
-- UP MIGRATION: Product reports (錯誤回報)
-- Created: 2026-05-07
-- 說明：
--   使用者可在產品詳情 dialog 提交「資料錯誤」回報。Admin 後台會列出
--   所有 report 並追蹤狀態（planned / in-progress / completed）。
--
--   - 任何人（含未登入訪客）皆可送出 → INSERT policy 開給 anon + authenticated。
--     anon 必須帶 user_id IS NULL；登入者必須帶 user_id = auth.uid()。
--   - 一般人沒有 SELECT / UPDATE / DELETE policy，送出後就無法再讀回。
--   - Admin 透過 SECURITY DEFINER RPC 讀寫，函式內呼叫 assert_caller_is_admin()。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. product_report_status / product_report_category enums
-- ---------------------------------------------------------------------
create type public.product_report_status as enum ('planned', 'in-progress', 'completed');

create type public.product_report_category as enum (
  'nutrition',       -- 營養品成分有誤
  'spec',            -- 包裝 / 容量 / 匙數有誤
  'classification',  -- 營養品分類有誤
  'other'            -- 其他問題
);


-- ---------------------------------------------------------------------
-- 2. product_reports 表
-- ---------------------------------------------------------------------
create table public.product_reports (
  id              uuid                            primary key default gen_random_uuid(),
  product_id      text                            not null references public.products(license_no) on delete cascade,
  user_id         uuid                            references auth.users(id) on delete set null,
  reporter_name   text,                           -- 訪客填的，登入用戶為 null（前端強制）
  category        public.product_report_category  not null,
  description     text                            not null,
  status          public.product_report_status    not null default 'planned',
  admin_note      text,
  created_at      timestamptz                     not null default now(),
  updated_at      timestamptz                     not null default now(),

  constraint product_reports_description_length
    check (char_length(trim(description)) between 1 and 2000),

  constraint product_reports_reporter_name_length
    check (reporter_name is null or char_length(trim(reporter_name)) between 1 and 50)
);

create index idx_product_reports_status      on public.product_reports(status);
create index idx_product_reports_created_at  on public.product_reports(created_at desc);
create index idx_product_reports_product_id  on public.product_reports(product_id);
create index idx_product_reports_user_id     on public.product_reports(user_id);

create trigger product_reports_set_updated_at
  before update on public.product_reports
  for each row
  execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 3. Row Level Security
--   只開 INSERT，且開給 anon + authenticated。
--   - anon：必須 user_id IS NULL
--   - authenticated：必須 user_id = auth.uid()
--   SELECT / UPDATE / DELETE 一律經由 admin RPC。
-- ---------------------------------------------------------------------
alter table public.product_reports enable row level security;

create policy "product_reports_insert_anon"
  on public.product_reports for insert
  to anon
  with check (user_id is null);

create policy "product_reports_insert_authenticated"
  on public.product_reports for insert
  to authenticated
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 4. Admin RPC：list_product_reports
--   回傳所有 report，附上產品中文名與回報者 email（join auth.users）。
--   p_status：可選，不傳就回全部。
-- ---------------------------------------------------------------------
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
  updated_at      timestamptz
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
    r.updated_at
  from public.product_reports r
  left join public.products p on p.license_no = r.product_id
  left join auth.users u on u.id = r.user_id
  where p_status is null or r.status = p_status
  order by r.created_at desc;
end;
$$;


-- ---------------------------------------------------------------------
-- 5. Admin RPC：update_product_report_status（同時可寫 admin_note）
-- ---------------------------------------------------------------------
create or replace function public.update_product_report_status(
  p_id          uuid,
  p_status      public.product_report_status,
  p_admin_note  text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  update public.product_reports
    set status     = p_status,
        admin_note = p_admin_note
    where id = p_id;

  if not found then
    raise exception 'product_report not found: %', p_id;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 6. Admin RPC：get_pending_product_report_count
--   讓 sidebar 顯示紅點 badge。判定條件：status = 'planned'。
-- ---------------------------------------------------------------------
create or replace function public.get_pending_product_report_count()
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

  select count(*) into v_count
  from public.product_reports
  where status = 'planned';

  return coalesce(v_count, 0);
end;
$$;


-- ---------------------------------------------------------------------
-- 7. 授權
-- ---------------------------------------------------------------------
revoke all on function public.list_product_reports(public.product_report_status) from public;
revoke all on function public.update_product_report_status(uuid, public.product_report_status, text) from public;
revoke all on function public.get_pending_product_report_count() from public;

grant execute on function public.list_product_reports(public.product_report_status) to authenticated;
grant execute on function public.update_product_report_status(uuid, public.product_report_status, text) to authenticated;
grant execute on function public.get_pending_product_report_count() to authenticated;
