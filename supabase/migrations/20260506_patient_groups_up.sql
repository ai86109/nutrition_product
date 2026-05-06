-- =====================================================================
-- UP MIGRATION: Patient Groups
-- Created: 2026-05-06
-- 說明：
--   新增 patient_groups（群組）與 patient_group_memberships（多對多
--   關聯）兩張表，搭配 RLS。
--   - 同一使用者底下不可有同名群組（UNIQUE(user_id, name)）
--   - 刪除群組時，memberships 由 DB 層 cascade 清掉
--   - 刪除病人時，memberships 同步 cascade
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. patient_groups
-- ---------------------------------------------------------------------
create table public.patient_groups (
  id          uuid         primary key default gen_random_uuid(),
  user_id     uuid         not null references auth.users(id) on delete cascade,
  name        text         not null,
  sort_order  integer      not null default 0,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now(),

  constraint patient_groups_name_not_empty check (length(trim(name)) > 0),
  constraint patient_groups_user_name_unique unique (user_id, name)
);

create index idx_patient_groups_user_id   on public.patient_groups(user_id);
create index idx_patient_groups_user_sort on public.patient_groups(user_id, sort_order);

create trigger patient_groups_set_updated_at
  before update on public.patient_groups
  for each row
  execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 2. patient_group_memberships（多對多）
-- ---------------------------------------------------------------------
create table public.patient_group_memberships (
  patient_id  uuid         not null references public.patients(id)       on delete cascade,
  group_id    uuid         not null references public.patient_groups(id) on delete cascade,
  created_at  timestamptz  not null default now(),

  primary key (patient_id, group_id)
);

create index idx_patient_group_memberships_patient on public.patient_group_memberships(patient_id);
create index idx_patient_group_memberships_group   on public.patient_group_memberships(group_id);


-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
alter table public.patient_groups            enable row level security;
alter table public.patient_group_memberships enable row level security;

-- patient_groups：本人 select / insert / update / delete
create policy "patient_groups_select_own"
  on public.patient_groups for select
  using (auth.uid() = user_id);

create policy "patient_groups_insert_own"
  on public.patient_groups for insert
  with check (auth.uid() = user_id);

create policy "patient_groups_update_own"
  on public.patient_groups for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "patient_groups_delete_own"
  on public.patient_groups for delete
  using (auth.uid() = user_id);

-- patient_group_memberships：以 patient.user_id 為憑證
-- （patient 與 group 兩端都屬於同一個 user 才有意義；以 patient 一端為主即可，
--  因為 group_id 也會經 RLS 在 select 時被過濾。）
create policy "patient_group_memberships_select_own"
  on public.patient_group_memberships for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = patient_group_memberships.patient_id
        and p.user_id = auth.uid()
    )
  );

create policy "patient_group_memberships_insert_own"
  on public.patient_group_memberships for insert
  with check (
    exists (
      select 1 from public.patients p
      where p.id = patient_group_memberships.patient_id
        and p.user_id = auth.uid()
    )
    and exists (
      select 1 from public.patient_groups g
      where g.id = patient_group_memberships.group_id
        and g.user_id = auth.uid()
    )
  );

create policy "patient_group_memberships_delete_own"
  on public.patient_group_memberships for delete
  using (
    exists (
      select 1 from public.patients p
      where p.id = patient_group_memberships.patient_id
        and p.user_id = auth.uid()
    )
  );
