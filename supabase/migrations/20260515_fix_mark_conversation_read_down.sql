-- =====================================================================
-- DOWN MIGRATION: 還原 mark_conversation_read 為 20260514 的版本
-- =====================================================================

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

  if v_is_admin then
    if p_kind = 'wish' then
      update public.wishes set last_read_by_admin_at = now() where id = p_id;
    else
      update public.product_reports set last_read_by_admin_at = now() where id = p_id;
    end if;
    return;
  end if;

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

revoke all on function public.mark_conversation_read(text, uuid) from public;
grant execute on function public.mark_conversation_read(text, uuid) to authenticated;
