-- =====================================================================
-- DOWN MIGRATION: Product reports
-- Created: 2026-05-07
-- =====================================================================

drop function if exists public.get_pending_product_report_count();
drop function if exists public.update_product_report_status(uuid, public.product_report_status, text);
drop function if exists public.list_product_reports(public.product_report_status);

drop policy if exists "product_reports_insert_authenticated" on public.product_reports;
drop policy if exists "product_reports_insert_anon" on public.product_reports;

drop trigger if exists product_reports_set_updated_at on public.product_reports;

drop table if exists public.product_reports;

drop type if exists public.product_report_category;
drop type if exists public.product_report_status;
