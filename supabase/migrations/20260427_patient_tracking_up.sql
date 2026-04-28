-- =====================================================================
-- UP MIGRATION: Patient Tracking
-- Created: 2026-04-27
-- 說明：
--   新增 patients 與 patient_snapshots 兩張表，搭配 RLS。
--   snapshot 凍結不可編輯，因此 patient_snapshots 不開放 UPDATE policy。
--   病人 + snapshot 採 cascade delete（刪除確認由前端 dialog 攔截）。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. 通用 updated_at trigger function（若已存在則 replace，不會破壞現有用法）
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 2. patients
-- ---------------------------------------------------------------------
create table public.patients (
  id          uuid         primary key default gen_random_uuid(),
  user_id     uuid         not null references auth.users(id) on delete cascade,
  name        text         not null,
  sort_order  integer      not null default 0,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now(),

  constraint patients_name_not_empty check (length(trim(name)) > 0),
  constraint patients_user_name_unique unique (user_id, name)
);

create index idx_patients_user_id    on public.patients(user_id);
create index idx_patients_user_sort  on public.patients(user_id, sort_order);

create trigger patients_set_updated_at
  before update on public.patients
  for each row
  execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 3. patient_snapshots
-- ---------------------------------------------------------------------
create table public.patient_snapshots (
  id                 uuid         primary key default gen_random_uuid(),
  patient_id         uuid         not null references public.patients(id) on delete cascade,
  user_id            uuid         not null references auth.users(id) on delete cascade,

  -- 生理資訊：{ height, weight, age, gender, bmi?, ibw?, abw? }
  bio_info           jsonb        not null default '{}'::jsonb,

  -- 每日目標
  calorie_target     numeric      null,                          -- 熱量 (kcal)
  protein_range      jsonb        null,                          -- { min, max }
  meals_per_day      integer      null,                          -- 未勾選 checkbox 時為 null

  -- 選取的營養品（凍結顯示用資訊）
  -- [{ license_no, product_id, variant_id, name_zh, name_en, brand, form,
  --    serving_label, serving_amount, serving_unit, quantity }, ...]
  selected_products  jsonb        not null default '[]'::jsonb,

  notes              text         null,
  created_at         timestamptz  not null default now()
);

create index idx_patient_snapshots_patient_id  on public.patient_snapshots(patient_id);
create index idx_patient_snapshots_user_id     on public.patient_snapshots(user_id);
create index idx_patient_snapshots_patient_created
  on public.patient_snapshots(patient_id, created_at desc);


-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------
alter table public.patients          enable row level security;
alter table public.patient_snapshots enable row level security;

-- patients：本人可 select / insert / update / delete
create policy "patients_select_own"
  on public.patients for select
  using (auth.uid() = user_id);

create policy "patients_insert_own"
  on public.patients for insert
  with check (auth.uid() = user_id);

create policy "patients_update_own"
  on public.patients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "patients_delete_own"
  on public.patients for delete
  using (auth.uid() = user_id);

-- patient_snapshots：本人可 select / insert / delete（不開放 update）
create policy "patient_snapshots_select_own"
  on public.patient_snapshots for select
  using (auth.uid() = user_id);

create policy "patient_snapshots_insert_own"
  on public.patient_snapshots for insert
  with check (auth.uid() = user_id);

create policy "patient_snapshots_delete_own"
  on public.patient_snapshots for delete
  using (auth.uid() = user_id);
