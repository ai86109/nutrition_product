-- =====================================================================
-- UP MIGRATION: Product images (admin upload + future user upload review)
-- Created: 2026-05-04
-- 說明：
--   為「產品圖片」功能建立資料層，包含：
--     1. public.product_images 表（含 source / status / reviewer 欄位，
--        為未來「使用者上傳→admin 審核」流程預留，本次只用 admin 直送 approved）
--     2. RLS policies（前端只能讀 approved；寫入一律走 RPC）
--     3. Storage bucket 'product-images'（public read、admin-only write）
--     4. Admin RPCs（沿用 assert_caller_is_admin() 模式）
--   每個產品 approved + pending 圖片數量上限 = 5。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. 表結構
-- ---------------------------------------------------------------------
create table public.product_images (
  id              uuid primary key default gen_random_uuid(),
  license_no      text not null
                    references public.products(license_no) on delete cascade,
  storage_path    text not null,
  display_order   int  not null default 0,

  width           int,
  height          int,
  byte_size       int,

  -- 預留審核流程欄位（本次僅 admin 直送 approved，但 schema 一次到位避免日後 alter）
  source          text not null default 'admin'
                    check (source in ('admin', 'user')),
  uploader_id     uuid references auth.users(id) on delete set null,
  status          text not null default 'approved'
                    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,
  rejection_reason text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index product_images_license_status_order_idx
  on public.product_images (license_no, status, display_order);

create index product_images_pending_idx
  on public.product_images (status)
  where status = 'pending';


-- ---------------------------------------------------------------------
-- 2. updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.product_images_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger product_images_set_updated_at
before update on public.product_images
for each row
execute function public.product_images_set_updated_at();


-- ---------------------------------------------------------------------
-- 3. RLS：開啟 + select policies。寫入路徑全部走 RPC（不開 INSERT/UPDATE/DELETE policy）
-- ---------------------------------------------------------------------
alter table public.product_images enable row level security;

-- 任何人（含未登入）都可讀 approved
create policy "approved images are public readable"
  on public.product_images
  for select
  using (status = 'approved');

-- admin 可讀全部（pending / rejected 也看得到，未來審核 UI 用）
create policy "admins can read all images"
  on public.product_images
  for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'
    )
  );


-- ---------------------------------------------------------------------
-- 4. Storage bucket：public read
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------
-- 5. Storage policies（限定 product-images bucket）
-- ---------------------------------------------------------------------
create policy "product-images: public read"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "product-images: admin insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'
    )
  );

create policy "product-images: admin update"
  on storage.objects
  for update
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'
    )
  );

create policy "product-images: admin delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'
    )
  );


-- =====================================================================
-- 6. Admin RPCs
-- =====================================================================

-- ---------------------------------------------------------------------
-- 6.1 列出某產品所有圖片（含 pending / rejected，給 admin 用）
-- ---------------------------------------------------------------------
create or replace function public.get_product_images(
  target_license_no text
)
returns table (
  id            uuid,
  license_no    text,
  storage_path  text,
  display_order int,
  status        text,
  source        text,
  width         int,
  height        int,
  byte_size     int,
  created_at    timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_caller_is_admin();

  return query
  select
    pi.id,
    pi.license_no,
    pi.storage_path,
    pi.display_order,
    pi.status,
    pi.source,
    pi.width,
    pi.height,
    pi.byte_size,
    pi.created_at
  from public.product_images pi
  where pi.license_no = target_license_no
  order by pi.display_order asc, pi.created_at asc;
end;
$$;


-- ---------------------------------------------------------------------
-- 6.2 新增圖片（admin 直送 approved）
--     ・檢查 approved + pending 總和 < 5（即新增後 ≤ 5）
--     ・display_order 自動 = 現有 max + 1（從 0 起算）
-- ---------------------------------------------------------------------
create or replace function public.add_product_image(
  target_license_no text,
  p_storage_path    text,
  p_width           int,
  p_height          int,
  p_byte_size       int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
  next_order    int;
  new_id        uuid;
begin
  perform public.assert_caller_is_admin();

  -- 產品必須存在
  if not exists (
    select 1 from public.products p where p.license_no = target_license_no
  ) then
    raise exception 'product not found: %', target_license_no;
  end if;

  -- approved + pending 總和不可達 5（避免新增後超過上限）
  select count(*) into current_count
    from public.product_images pi
    where pi.license_no = target_license_no
      and pi.status in ('approved', 'pending');

  if current_count >= 5 then
    raise exception 'image limit reached: max 5 active images per product (current: %)', current_count;
  end if;

  -- 計算下一個 display_order
  select coalesce(max(pi.display_order), -1) + 1 into next_order
    from public.product_images pi
    where pi.license_no = target_license_no
      and pi.status in ('approved', 'pending');

  insert into public.product_images (
    license_no, storage_path, display_order,
    width, height, byte_size,
    source, status, uploader_id
  )
  values (
    target_license_no, p_storage_path, next_order,
    p_width, p_height, p_byte_size,
    'admin', 'approved', auth.uid()
  )
  returning id into new_id;

  return new_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 6.3 重新排序
--     傳入該產品的圖片 id 陣列，依陣列順序設定 display_order = 0..n-1
--     注意：陣列內的 id 必須完全等於該產品目前 approved + pending 的全部 id
--           （避免遺漏或夾帶其他產品的 id）
-- ---------------------------------------------------------------------
create or replace function public.reorder_product_images(
  target_license_no text,
  ordered_ids       uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_count int;
  matched_count  int;
begin
  perform public.assert_caller_is_admin();

  -- 取目前該產品有效（approved + pending）圖片數
  select count(*) into expected_count
    from public.product_images pi
    where pi.license_no = target_license_no
      and pi.status in ('approved', 'pending');

  -- 檢查傳入的 ids 全部屬於該產品且為有效狀態
  select count(*) into matched_count
    from unnest(ordered_ids) as oid
    join public.product_images pi on pi.id = oid
    where pi.license_no = target_license_no
      and pi.status in ('approved', 'pending');

  if matched_count <> expected_count
     or matched_count <> array_length(ordered_ids, 1) then
    raise exception 'reorder ids mismatch: expected % active ids for product %, got %',
      expected_count, target_license_no, matched_count;
  end if;

  -- 依陣列順序更新 display_order
  update public.product_images pi
    set display_order = sub.new_order
    from (
      select oid as id, ord - 1 as new_order
      from unnest(ordered_ids) with ordinality as t(oid, ord)
    ) sub
    where pi.id = sub.id;
end;
$$;


-- ---------------------------------------------------------------------
-- 6.4 刪除圖片
--     回傳 storage_path，前端拿到後再呼叫 supabase.storage.from(...).remove()
--     （避免在 RPC 內混 storage 操作，職責分離）
-- ---------------------------------------------------------------------
create or replace function public.delete_product_image(
  image_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  removed_path text;
begin
  perform public.assert_caller_is_admin();

  delete from public.product_images
    where id = image_id
    returning storage_path into removed_path;

  if removed_path is null then
    raise exception 'image not found: %', image_id;
  end if;

  return removed_path;
end;
$$;


-- ---------------------------------------------------------------------
-- 7. 授權：authenticated 可呼叫，admin 檢查在 function 內
-- ---------------------------------------------------------------------
revoke all on function public.get_product_images(text)                            from public;
revoke all on function public.add_product_image(text, text, int, int, int)        from public;
revoke all on function public.reorder_product_images(text, uuid[])                from public;
revoke all on function public.delete_product_image(uuid)                          from public;

grant execute on function public.get_product_images(text)                         to authenticated;
grant execute on function public.add_product_image(text, text, int, int, int)     to authenticated;
grant execute on function public.reorder_product_images(text, uuid[])             to authenticated;
grant execute on function public.delete_product_image(uuid)                       to authenticated;
