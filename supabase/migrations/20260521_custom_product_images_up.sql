-- =====================================================================
-- P6 自訂營養品縮圖上傳
--   1) user_custom_products 加 image_path 欄位（存 bucket 內相對路徑）
--   2) 建私有 bucket custom-product-images（只允許 webp、限制大小）
--   3) storage.objects RLS：每位 user 只能讀/寫/刪自己 <user_id>/ 資料夾下的物件
--
-- 圖片本身私有，前端用 createSignedUrl 產生有時效的網址顯示。
-- 路徑格式：<user_id>/<uuid>.webp → foldername[1] = user_id 作為擁有者判斷依據。
-- =====================================================================

-- 1) 欄位（nullable，沒有圖的產品為 NULL）
alter table public.user_custom_products
  add column if not exists image_path text;

-- 2) 私有 bucket（webp only、單檔上限 2 MB）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-product-images',
  'custom-product-images',
  false,
  2097152,
  array['image/webp']
)
on conflict (id) do nothing;

-- 3) storage.objects RLS（限定本人資料夾）
create policy "Custom product images: owner insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'custom-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Custom product images: owner select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'custom-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Custom product images: owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'custom-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'custom-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Custom product images: owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'custom-product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
