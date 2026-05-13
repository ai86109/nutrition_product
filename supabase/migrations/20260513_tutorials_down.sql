-- =====================================================================
-- DOWN MIGRATION: Tutorials
-- Created: 2026-05-13
-- =====================================================================

drop function if exists public.swap_tutorial_order(uuid, text);
drop function if exists public.delete_tutorial(uuid);
drop function if exists public.update_tutorial(uuid, text, text, text, boolean);
drop function if exists public.create_tutorial(text, text, text, boolean);
drop function if exists public.list_tutorials_admin();

drop policy if exists "tutorials_read_published" on public.tutorials;

drop trigger if exists tutorials_set_updated_at on public.tutorials;

drop table if exists public.tutorials;
