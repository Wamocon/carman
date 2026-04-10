alter table public.vehicles
  add column if not exists engine_power_ps int;

alter table public.vehicles
  drop constraint if exists vehicles_engine_power_ps_range_check;

alter table public.vehicles
  add constraint vehicles_engine_power_ps_range_check
  check (engine_power_ps is null or (engine_power_ps >= 0 and engine_power_ps <= 3000));
