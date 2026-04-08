-- Vehicle detail enrichment for assisted entry and VIN-based prefill

alter table public.vehicles
  add column if not exists vin text,
  add column if not exists vehicle_type text,
  add column if not exists body_style text,
  add column if not exists variant text,
  add column if not exists engine_description text,
  add column if not exists transmission text,
  add column if not exists drive_type text,
  add column if not exists doors int,
  add column if not exists engine_power_kw int,
  add column if not exists engine_displacement_cc int,
  add column if not exists special_equipment text,
  add column if not exists catalog_source text;

alter table public.vehicles
  drop constraint if exists vehicles_vin_length_check;

alter table public.vehicles
  add constraint vehicles_vin_length_check
  check (vin is null or char_length(vin) = 17);

alter table public.vehicles
  drop constraint if exists vehicles_doors_range_check;

alter table public.vehicles
  add constraint vehicles_doors_range_check
  check (doors is null or (doors >= 1 and doors <= 9));

alter table public.vehicles
  drop constraint if exists vehicles_engine_power_kw_range_check;

alter table public.vehicles
  add constraint vehicles_engine_power_kw_range_check
  check (engine_power_kw is null or (engine_power_kw >= 0 and engine_power_kw <= 2000));

alter table public.vehicles
  drop constraint if exists vehicles_engine_displacement_cc_range_check;

alter table public.vehicles
  add constraint vehicles_engine_displacement_cc_range_check
  check (
    engine_displacement_cc is null
    or (engine_displacement_cc >= 0 and engine_displacement_cc <= 20000)
  );

create index if not exists idx_vehicles_vin on public.vehicles(vin);
create index if not exists idx_vehicles_make_model_year on public.vehicles(make, model, year);
