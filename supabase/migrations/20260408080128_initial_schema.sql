-- ============================================================================
-- Smart Car Manager V1 — Initial Schema
-- Managed exclusively via Supabase migrations.
-- ============================================================================

-- 1. User Profiles -----------------------------------------------------------
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	email text not null,
	display_name text,
	subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
	on public.profiles for select
	using ((select auth.uid()) = id);

create policy "Users can update own profile"
	on public.profiles for update
	using ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
	insert into public.profiles (id, email, display_name)
	values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute procedure public.handle_new_user();


-- 2. Vehicles ----------------------------------------------------------------
create table if not exists public.vehicles (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	make text not null,
	model text not null,
	year int not null check (year >= 1900 and year <= 2100),
	fuel_type text not null check (fuel_type in ('petrol','diesel','electric','hybrid','lpg','cng')),
	license_plate text not null default '',
	current_mileage int not null default 0 check (current_mileage >= 0),
	image_url text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create index if not exists idx_vehicles_user on public.vehicles(user_id);

create policy "Users can CRUD own vehicles"
	on public.vehicles for all
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);


-- 3. Cost Entries ------------------------------------------------------------
create table if not exists public.cost_entries (
	id uuid primary key default gen_random_uuid(),
	vehicle_id uuid not null references public.vehicles(id) on delete cascade,
	user_id uuid not null references public.profiles(id) on delete cascade,
	category text not null check (category in ('fuel','maintenance','repair','insurance','tax','leasing','parking','other')),
	title text not null,
	amount numeric(12,2) not null check (amount >= 0),
	date date not null,
	mileage int check (mileage >= 0),
	liters numeric(8,2) check (liters > 0),
	price_per_liter numeric(6,3) check (price_per_liter > 0),
	notes text,
	created_at timestamptz not null default now()
);

alter table public.cost_entries enable row level security;

create policy "Users can CRUD own cost entries"
	on public.cost_entries for all
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

create index if not exists idx_cost_entries_vehicle on public.cost_entries(vehicle_id);
create index if not exists idx_cost_entries_date on public.cost_entries(date);


-- 4. Reminders ---------------------------------------------------------------
create table if not exists public.reminders (
	id uuid primary key default gen_random_uuid(),
	vehicle_id uuid not null references public.vehicles(id) on delete cascade,
	user_id uuid not null references public.profiles(id) on delete cascade,
	title text not null,
	reminder_type text not null check (reminder_type in ('date','mileage','both')),
	due_date date,
	due_mileage int check (due_mileage >= 0),
	is_completed boolean not null default false,
	notes text,
	created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "Users can CRUD own reminders"
	on public.reminders for all
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

create index if not exists idx_reminders_vehicle on public.reminders(vehicle_id);


-- 5. Updated_at trigger helper -----------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create trigger set_profiles_updated_at
	before update on public.profiles
	for each row execute procedure public.set_updated_at();

create trigger set_vehicles_updated_at
	before update on public.vehicles
	for each row execute procedure public.set_updated_at();
