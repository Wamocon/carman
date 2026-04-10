alter table public.vehicles
  add column if not exists status text not null default 'owned',
  add column if not exists sold_at timestamptz,
  add column if not exists sale_cost_entry_id uuid references public.cost_entries(id) on delete set null;

alter table public.vehicles
  drop constraint if exists vehicles_status_check;

alter table public.vehicles
  add constraint vehicles_status_check
  check (status in ('owned', 'sold'));

create index if not exists idx_vehicles_user_status
  on public.vehicles(user_id, status);

alter table public.cost_entries
  add column if not exists is_vehicle_sale boolean not null default false;

alter table public.cost_entries
  drop constraint if exists cost_entries_amount_check;

alter table public.cost_entries
  drop constraint if exists cost_entries_amount_range_check;

alter table public.cost_entries
  add constraint cost_entries_amount_range_check
  check (amount >= -999999.99 and amount <= 999999.99);

alter table public.cost_entries
  drop constraint if exists cost_entries_vehicle_sale_amount_check;

alter table public.cost_entries
  add constraint cost_entries_vehicle_sale_amount_check
  check (
    (is_vehicle_sale = true and amount <= 0)
    or (is_vehicle_sale = false and amount >= 0)
  );
