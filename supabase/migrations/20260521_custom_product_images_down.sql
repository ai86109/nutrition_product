-- =====================================================================
-- P6 rollback
--   注意：刪 bucket 前要先清空物件，會刪掉所有已上傳的自訂營養品圖片。
-- =====================================================================

alter table public.user_custom_products
  drop column if exists image_path;

drop policy if exists "Custom product images: owner insert" on storage.objects;
drop policy if exists "Custom product images: owner select" on storage.objects;
drop policy if exists "Custom product images: owner update" on storage.objects;
drop policy if exists "Custom product images: owner delete" on storage.objects;

-- 先清空 bucket 內物件，再刪 bucket
delete from storage.objects where bucket_id = 'custom-product-images';
delete from storage.buckets where id = 'custom-product-images';
