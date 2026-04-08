-- Cost detail feature: comments and invoice documents

create table if not exists public.cost_comments (
  id uuid primary key default gen_random_uuid(),
  cost_entry_id uuid not null references public.cost_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint cost_comments_body_not_empty check (char_length(trim(body)) > 0)
);

create table if not exists public.cost_invoices (
  id uuid primary key default gen_random_uuid(),
  cost_entry_id uuid not null references public.cost_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  invoice_number text,
  invoice_date date,
  note text,
  created_at timestamptz not null default now(),
  constraint cost_invoices_file_size_check check (file_size_bytes > 0)
);

create index if not exists idx_cost_comments_cost_entry_created
  on public.cost_comments(cost_entry_id, created_at desc);

create index if not exists idx_cost_invoices_cost_entry_created
  on public.cost_invoices(cost_entry_id, created_at desc);

alter table public.cost_comments enable row level security;
alter table public.cost_invoices enable row level security;

drop policy if exists "Users can CRUD own cost comments" on public.cost_comments;
create policy "Users can CRUD own cost comments"
  on public.cost_comments for all
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.cost_entries ce
      where ce.id = cost_entry_id
        and ce.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.cost_entries ce
      where ce.id = cost_entry_id
        and ce.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can CRUD own cost invoices" on public.cost_invoices;
create policy "Users can CRUD own cost invoices"
  on public.cost_invoices for all
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.cost_entries ce
      where ce.id = cost_entry_id
        and ce.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.cost_entries ce
      where ce.id = cost_entry_id
        and ce.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public)
values ('cost-invoices', 'cost-invoices', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own cost invoices objects" on storage.objects;
create policy "Users can read own cost invoices objects"
  on storage.objects for select
  using (
    bucket_id = 'cost-invoices'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can insert own cost invoices objects" on storage.objects;
create policy "Users can insert own cost invoices objects"
  on storage.objects for insert
  with check (
    bucket_id = 'cost-invoices'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can delete own cost invoices objects" on storage.objects;
create policy "Users can delete own cost invoices objects"
  on storage.objects for delete
  using (
    bucket_id = 'cost-invoices'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
