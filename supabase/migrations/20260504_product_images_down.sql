-- =====================================================================
-- DOWN MIGRATION: Reverse of 20260504_product_images_up.sql
-- Created: 2026-05-04
-- 說明：
--   完整回退 product_images 功能。執行後資料庫狀態回到 up migration 之前。
--   ⚠ 會清空並刪除 storage bucket 'product-images' 內的所有物件。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Drop RPCs
-- ---------------------------------------------------------------------
drop function if exists public.delete_product_image(uuid);
drop function if exists public.reorder_product_images(text, uuid[]);
drop function if exists public.add_product_image(text, text, int, int, int);
drop function if exists public.get_product_images(text);


-- ---------------------------------------------------------------------
-- 2. Drop storage policies
-- ---------------------------------------------------------------------
drop policy if exists "product-images: admin delete" on storage.objects;
drop policy if exists "product-images: admin update" on storage.objects;
drop policy if exists "product-images: admin insert" on storage.objects;
drop policy if exists "product-images: public read"  on storage.objects;


-- ---------------------------------------------------------------------
-- 3. 清空並刪除 storage bucket
--    必須先清掉 objects 才能刪 bucket
-- ---------------------------------------------------------------------
delete from storage.objects where bucket_id = 'product-images';
delete from storage.buckets where id = 'product-images';


-- ---------------------------------------------------------------------
-- 4. Drop table policies、trigger、表本身
-- ---------------------------------------------------------------------
drop policy if exists "admins can read all images"        on public.product_images;
drop policy if exists "approved images are public readable" on public.product_images;

drop trigger if exists product_images_set_updated_at on public.product_images;
drop function if exists public.product_images_set_updated_at();

drop table if exists public.product_images;
