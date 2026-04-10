-- Vehicle acquisition model for purchase, financing, and leasing

alter table public.vehicles
  add column if not exists acquisition_type text not null default 'purchase',
  add column if not exists acquisition_subtype text,
  add column if not exists down_payment numeric(12,2),
  add column if not exists monthly_payment numeric(12,2),
  add column if not exists term_months int,
  add column if not exists final_payment numeric(12,2),
  add column if not exists contract_start_date date;

alter table public.vehicles
  drop constraint if exists vehicles_acquisition_type_check;

alter table public.vehicles
  add constraint vehicles_acquisition_type_check
  check (acquisition_type in ('purchase', 'finance', 'lease'));

alter table public.vehicles
  drop constraint if exists vehicles_acquisition_subtype_check;

alter table public.vehicles
  add constraint vehicles_acquisition_subtype_check
  check (
    acquisition_subtype is null
    or (
      acquisition_type = 'purchase'
      and acquisition_subtype in ('cash', 'dealer')
    )
    or (
      acquisition_type = 'finance'
      and acquisition_subtype in ('classic_loan', 'balloon', 'three_way')
    )
    or (
      acquisition_type = 'lease'
      and acquisition_subtype in ('kilometerleasing', 'restwertleasing')
    )
  );

alter table public.vehicles
  drop constraint if exists vehicles_down_payment_check;

alter table public.vehicles
  add constraint vehicles_down_payment_check
  check (down_payment is null or down_payment >= 0);

alter table public.vehicles
  drop constraint if exists vehicles_monthly_payment_check;

alter table public.vehicles
  add constraint vehicles_monthly_payment_check
  check (monthly_payment is null or monthly_payment >= 0);

alter table public.vehicles
  drop constraint if exists vehicles_term_months_check;

alter table public.vehicles
  add constraint vehicles_term_months_check
  check (term_months is null or term_months > 0);

alter table public.vehicles
  drop constraint if exists vehicles_final_payment_check;

alter table public.vehicles
  add constraint vehicles_final_payment_check
  check (final_payment is null or final_payment >= 0);

update public.vehicles
set acquisition_type = coalesce(acquisition_type, 'purchase')
where acquisition_type is null;

update public.vehicles
set acquisition_subtype = 'cash'
where acquisition_type = 'purchase'
  and acquisition_subtype is null
  and purchase_price is not null;
