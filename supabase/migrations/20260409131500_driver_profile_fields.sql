alter table public.profiles
  add column if not exists driver_first_name text,
  add column if not exists driver_last_name text,
  add column if not exists driver_birth_date date,
  add column if not exists driver_license_country text,
  add column if not exists driver_license_issue_date date,
  add column if not exists driver_license_class text,
  add column if not exists driver_profile_completed boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_driver_name_pair_check,
  drop constraint if exists profiles_driver_birth_date_check,
  drop constraint if exists profiles_driver_license_issue_date_check,
  drop constraint if exists profiles_driver_license_country_check;

alter table public.profiles
  add constraint profiles_driver_name_pair_check
    check (
      (driver_first_name is null and driver_last_name is null)
      or
      (driver_first_name is not null and driver_last_name is not null)
    ),
  add constraint profiles_driver_birth_date_check
    check (driver_birth_date is null or driver_birth_date <= current_date),
  add constraint profiles_driver_license_issue_date_check
    check (driver_license_issue_date is null or driver_license_issue_date <= current_date),
  add constraint profiles_driver_license_country_check
    check (driver_license_country is null or driver_license_country ~ '^[A-Z]{2}$');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  _display_name text;
  _driver_first_name text;
  _driver_last_name text;
  _driver_birth_date date;
  _driver_license_country text;
  _driver_license_issue_date date;
  _driver_license_class text;
begin
  _display_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
  _driver_first_name := nullif(trim(new.raw_user_meta_data ->> 'driver_first_name'), '');
  _driver_last_name := nullif(trim(new.raw_user_meta_data ->> 'driver_last_name'), '');
  _driver_birth_date := nullif(trim(new.raw_user_meta_data ->> 'driver_birth_date'), '')::date;
  _driver_license_country := upper(nullif(trim(new.raw_user_meta_data ->> 'driver_license_country'), ''));
  _driver_license_issue_date := nullif(trim(new.raw_user_meta_data ->> 'driver_license_issue_date'), '')::date;
  _driver_license_class := nullif(trim(new.raw_user_meta_data ->> 'driver_license_class'), '');

  insert into public.profiles (
    id,
    email,
    display_name,
    driver_first_name,
    driver_last_name,
    driver_birth_date,
    driver_license_country,
    driver_license_issue_date,
    driver_license_class,
    driver_profile_completed
  )
  values (
    new.id,
    new.email,
    _display_name,
    _driver_first_name,
    _driver_last_name,
    _driver_birth_date,
    _driver_license_country,
    _driver_license_issue_date,
    _driver_license_class,
    (
      _driver_first_name is not null
      and _driver_last_name is not null
      and _driver_birth_date is not null
      and _driver_license_country is not null
      and _driver_license_issue_date is not null
      and _driver_license_class is not null
    )
  );

  return new;
end;
$$;
