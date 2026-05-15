-- =====================================================================
-- UP MIGRATION: 修 mark_conversation_read RPC
-- Created: 2026-05-15
-- 說明：
--   原版本（20260514_conversation_messages_up.sql）有多條 raise exception
--   分支，且 v_is_admin 在 declare 區塊呼叫 is_caller_admin 初始化。
--   實測下 user 端標讀後 last_read_by_user_at 沒有更新（DB 端未寫入），
--   導致使用者離開個人中心再回來時紅點仍亮著。
--
--   重寫成扁平版本：
--     - 不再 raise（除了完全不合法的 p_kind）
--     - user 端用 `where id = p_id and user_id = auth.uid()` 自然過濾，
--       不是 owner 就 update 0 列、不影響其他人；不需要先 select owner 再
--       比對 + raise 的兩段式邏輯
--     - admin 端 update 不加 where 過濾（admin 可標任何對話為已讀）
--     - is_caller_admin 賦值移到 begin 區塊內（避免 declare-time 呼叫的
--       語意不確定性）
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
