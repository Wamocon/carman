-- Purchase tracking fields for per-vehicle total cost visibility

alter table public.vehicles
  add column if not exists purchase_price numeric(12,2),
  add column if not exists purchase_date date;

alter table public.vehicles
  drop constraint if exists vehicles_purchase_price_check;

alter table public.vehicles
  add constraint vehicles_purchase_price_check
  check (purchase_price is null or purchase_price >= 0);
