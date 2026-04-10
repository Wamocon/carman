-- --------------------------------------------------------------------------
-- CarMan — Upgrade Requests table for Free→Pro upgrade flow
-- --------------------------------------------------------------------------

create table if not exists public.upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_interval text not null check (billing_interval in ('month', 'year')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- RLS
alter table public.upgrade_requests enable row level security;

-- Users can insert their own upgrade requests
create policy "Users can create own upgrade requests"
  on public.upgrade_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can read their own upgrade requests
create policy "Users can read own upgrade requests"
  on public.upgrade_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Index for quick lookups
create index if not exists idx_upgrade_requests_user_id
  on public.upgrade_requests(user_id);
