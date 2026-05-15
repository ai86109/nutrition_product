-- =====================================================================
-- UP MIGRATION: mark_conversation_read 加 p_viewer_role 參數
-- Created: 2026-05-15
-- 說明：
--   原版本依靠 is_caller_admin() 判斷該更新 last_read_by_user_at 還是
--   last_read_by_admin_at。問題：admin 帳號的開發者在 /profile 看自己的
--   對話時，視角是「user」（看自己許願），但 caller role 是 'admin'，
--   RPC 因此走 admin 分支，更新到 last_read_by_admin_at，導致使用者視角
--   的未讀指針永遠清不掉。
--
--   修法：把「角色」與「視角」分離 — 由前端透過 p_viewer_role 明確指定
--   是以 user 身份還是 admin 身份在標讀。'admin' 視角會額外做 admin
--   role assertion，避免一般 user 偽造 admin viewer。
-- =====================================================================

-- 先 drop 舊簽名（兩參數），再 create 新簽名（三參數）
drop function if exists public.mark_conversation_read(text, uuid);

create or replace function public.mark_conversation_read(
  p_kind         text,
  p_id           uuid,
  p_viewer_role  text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_viewer_role = 'admin' then
    -- admin 視角：必須真的是 admin 才允許（防止 user 偽造）
    perform public.assert_caller_is_admin();

    if p_kind = 'wish' then
      update public.wishes
        set last_read_by_admin_at = now()
        where id = p_id;
    elsif p_kind = 'report' then
      update public.product_reports
        set last_read_by_admin_at = now()
        where id = p_id;
    else
      raise exception 'invalid kind: %', p_kind;
    end if;

  elsif p_viewer_role = 'user' then
    -- user 視角：只更新自己 owned 的對話（即使 caller 是 admin 帳號）
    if p_kind = 'wish' then
      update public.wishes
        set last_read_by_user_at = now()
        where id = p_id and user_id = auth.uid();
    elsif p_kind = 'report' then
      update public.product_reports
        set last_read_by_user_at = now()
        where id = p_id and user_id = auth.uid();
    else
      raise exception 'invalid kind: %', p_kind;
    end if;

  else
    raise exception 'invalid viewer_role: %', p_viewer_role;
  end if;
end;
$$;

revoke all on function public.mark_conversation_read(text, uuid, text) from public;
grant execute on function public.mark_conversation_read(text, uuid, text) to authenticated;
