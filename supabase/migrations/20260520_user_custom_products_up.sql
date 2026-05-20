-- =====================================================================
-- UP MIGRATION: User Custom Products
-- Created: 2026-05-20
-- 說明：
--   讓使用者新增「自訂營養品」（FDA 資料庫沒收錄的、或自家配方）。
--   完全私有（RLS 鎖在 user_id），不跨用戶共享。
--
--   - user_custom_products：產品本體 + 營養成分 jsonb（對齊 products.nutrition_facts shape）
--   - user_custom_variants：包裝規格（quantity, volume, unit），對齊 product_variants
--   - 軟刪除：deleted_at（保留歷史 snapshot 顯示）
--   - cap：3 筆/人，目前在應用層檢查（沿用 jsonb pattern：hook 內擋）
--
--   nutrition_facts 結構（與既有 products 一致）：
--     { "calories": { "unit": "kcal", "value": 250 },
--       "protein":  { "unit": "g",    "value": 9   }, ... }
--   應用層 Zod schema 會強制 calories/protein/carbohydrate/fat 必填，其他 optional。
--   DB 層只擋 jsonb 非空，不檢查欄位名稱（給未來新增微量元素彈性）。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. user_custom_products
-- ---------------------------------------------------------------------
create table public.user_custom_products (
  id              uuid         primary key default gen_random_uuid(),
  user_id         uuid         not null references auth.users(id) on delete cascade,

  name_zh         text         not null,
  name_en         text,
  brand           text         not null,
  form            text         not null,
  standard_weight numeric      not null,    -- nutrition_facts 標示的基準重量
  weight_unit     text         not null,    -- 'g' | 'ml'

  nutrition_facts jsonb        not null default '{}'::jsonb,
  notes           text,                     -- 使用者自填備註

  deleted_at      timestamptz,              -- 軟刪除（保留歷史 snapshot 顯示）

  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now(),

  constraint user_custom_products_name_zh_not_empty
    check (length(trim(name_zh)) > 0),
  constraint user_custom_products_brand_not_empty
    check (length(trim(brand)) > 0),
  constraint user_custom_products_form_valid
    check (form in ('liquid', 'powder', 'solid', 'other')),
  constraint user_custom_products_weight_unit_valid
    check (weight_unit in ('g', 'ml')),
  constraint user_custom_products_standard_weight_positive
    check (standard_weight > 0)
);

-- 查詢「我的未刪除自訂產品」用 partial index，省空間
create index idx_user_custom_products_user_active
  on public.user_custom_products(user_id)
  where deleted_at is null;

-- 查詢「我的所有自訂產品（含已刪除）」用一般 index（snapshot 反查）
create index idx_user_custom_products_user_all
  on public.user_custom_products(user_id);


-- ---------------------------------------------------------------------
-- 2. user_custom_variants
-- ---------------------------------------------------------------------
create table public.user_custom_variants (
  id                  uuid         primary key default gen_random_uuid(),
  custom_product_id   uuid         not null
                        references public.user_custom_products(id) on delete cascade,

  quantity            numeric      not null,   -- 包裝份數（24）
  volume              numeric      not null,   -- 每份容量（237）
  unit                text         not null,   -- 容器/份單位（罐、包、匙、瓶...）
  is_default          boolean      not null default false,
  sort_order          integer      not null default 0,

  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now(),

  constraint user_custom_variants_quantity_positive check (quantity > 0),
  constraint user_custom_variants_volume_positive   check (volume > 0),
  constraint user_custom_variants_unit_not_empty    check (length(trim(unit)) > 0)
);

create index idx_user_custom_variants_product
  on public.user_custom_variants(custom_product_id, sort_order);

-- 每個產品只能有一個 is_default = true
create unique index idx_user_custom_variants_one_default
  on public.user_custom_variants(custom_product_id)
  where is_default = true;


-- ---------------------------------------------------------------------
-- 3. updated_at triggers（重用既有 public.set_updated_at()）
-- ---------------------------------------------------------------------
create trigger user_custom_products_set_updated_at
  before update on public.user_custom_products
  for each row
  execute function public.set_updated_at();

create trigger user_custom_variants_set_updated_at
  before update on public.user_custom_variants
  for each row
  execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------
alter table public.user_custom_products enable row level security;
alter table public.user_custom_variants enable row level security;

-- user_custom_products：本人 select / insert / update / delete
create policy "user_custom_products_select_own"
  on public.user_custom_products for select
  using (auth.uid() = user_id);

create policy "user_custom_products_insert_own"
  on public.user_custom_products for insert
  with check (auth.uid() = user_id);

create policy "user_custom_products_update_own"
  on public.user_custom_products for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_custom_products_delete_own"
  on public.user_custom_products for delete
  using (auth.uid() = user_id);

-- user_custom_variants：以 parent product 的 user_id 為憑證
-- （參考 patient_group_memberships 寫法）
create policy "user_custom_variants_select_own"
  on public.user_custom_variants for select
  using (
    exists (
      select 1 from public.user_custom_products p
      where p.id = user_custom_variants.custom_product_id
        and p.user_id = auth.uid()
    )
  );

create policy "user_custom_variants_insert_own"
  on public.user_custom_variants for insert
  with check (
    exists (
      select 1 from public.user_custom_products p
      where p.id = user_custom_variants.custom_product_id
        and p.user_id = auth.uid()
    )
  );

create policy "user_custom_variants_update_own"
  on public.user_custom_variants for update
  using (
    exists (
      select 1 from public.user_custom_products p
      where p.id = user_custom_variants.custom_product_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_custom_products p
      where p.id = user_custom_variants.custom_product_id
        and p.user_id = auth.uid()
    )
  );

create policy "user_custom_variants_delete_own"
  on public.user_custom_variants for delete
  using (
    exists (
      select 1 from public.user_custom_products p
      where p.id = user_custom_variants.custom_product_id
        and p.user_id = auth.uid()
    )
  );
