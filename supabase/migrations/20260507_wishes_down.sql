-- =====================================================================
-- DOWN MIGRATION: Wish pool
-- Created: 2026-05-07
-- =====================================================================

drop function if exists public.update_wish_status(uuid, public.wish_status, text);
drop function if exists public.list_wishes(public.wish_status);

drop policy if exists "wishes_insert_own" on public.wishes;

drop trigger if exists wishes_set_updated_at on public.wishes;

drop table if exists public.wishes;

drop type if exists public.wish_status;
