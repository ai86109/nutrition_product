-- =====================================================================
-- DOWN MIGRATION: 還原 mark_conversation_read 為兩參數版本（取自
-- 20260515_fix_mark_conversation_read_up.sql 的內容）
-- =====================================================================

drop function if exists public.mark_conversation_read(text, uuid, text);

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
  v_is_admin boolean;
begin
  v_is_admin := public.is_caller_admin();

  if p_kind = 'wish' then
    if v_is_admin then
      update public.wishes
        set last_read_by_admin_at = now()
        where id = p_id;
    else
      update public.wishes
        set last_read_by_user_at = now()
        where id = p_id and user_id = auth.uid();
    end if;
  elsif p_kind = 'report' then
    if v_is_admin then
      update public.product_reports
        set last_read_by_admin_at = now()
        where id = p_id;
    else
      update public.product_reports
        set last_read_by_user_at = now()
        where id = p_id and user_id = auth.uid();
    end if;
  else
    raise exception 'invalid kind: %', p_kind;
  end if;
end;
$$;

revoke all on function public.mark_conversation_read(text, uuid) from public;
grant execute on function public.mark_conversation_read(text, uuid) to authenticated;
