-- =====================================================================
-- DOWN MIGRATION: 對話訊息（許願池 / 錯誤回報）
-- Created: 2026-05-14
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. 移除新增的 RPC
-- ---------------------------------------------------------------------
drop function if exists public.get_admin_total_unread_count();
drop function if exists public.get_my_total_unread_count();
drop function if exists public.list_my_product_reports();
drop function if exists public.list_my_wishes();
drop function if exists public.insert_conversation_message_admin(text, uuid, text);
drop function if exists public.list_conversation_messages_admin(text, uuid);
drop function if exists public.mark_conversation_read(text, uuid);
drop function if exists public.is_caller_admin();


-- ---------------------------------------------------------------------
-- 2. 恢復原始 list_wishes / list_product_reports（移除 unread_count）
-- ---------------------------------------------------------------------
drop function if exists public.list_wishes(public.wish_status);

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

revoke all on function public.list_wishes(public.wish_status) from public;
grant execute on function public.list_wishes(public.wish_status) to authenticated;


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

revoke all on function public.list_product_reports(public.product_report_status) from public;
grant execute on function public.list_product_reports(public.product_report_status) to authenticated;


-- ---------------------------------------------------------------------
-- 3. 移除 conversation_messages 表（含 RLS policies, indexes, FK 自動 drop）
-- ---------------------------------------------------------------------
drop table if exists public.conversation_messages;
drop type  if exists public.conversation_sender_role;


-- ---------------------------------------------------------------------
-- 4. 移除 wishes / product_reports 上的已讀指針欄位
-- ---------------------------------------------------------------------
alter table public.product_reports
  drop column if exists last_read_by_admin_at,
  drop column if exists last_read_by_user_at;

alter table public.wishes
  drop column if exists last_read_by_admin_at,
  drop column if exists last_read_by_user_at;
