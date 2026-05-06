-- =====================================================================
-- DOWN MIGRATION: User note templates
-- Created: 2026-05-06
-- =====================================================================

alter table public.user_preferences
  drop column note_templates;
