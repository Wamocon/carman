-- Vehicle detail enhancements: comments and image gallery

create table if not exists public.vehicle_comments (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint vehicle_comments_body_not_empty check (char_length(trim(body)) > 0)
);

create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  caption text,
  created_at timestamptz not null default now(),
  constraint vehicle_images_file_size_check check (file_size_bytes > 0)
);

create index if not exists idx_vehicle_comments_vehicle_created
  on public.vehicle_comments(vehicle_id, created_at desc);

create index if not exists idx_vehicle_images_vehicle_created
  on public.vehicle_images(vehicle_id, created_at desc);

alter table public.vehicle_comments enable row level security;
alter table public.vehicle_images enable row level security;

drop policy if exists "Users can CRUD own vehicle comments" on public.vehicle_comments;
create policy "Users can CRUD own vehicle comments"
  on public.vehicle_comments for all
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can CRUD own vehicle images" on public.vehicle_images;
create policy "Users can CRUD own vehicle images"
  on public.vehicle_images for all
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own vehicle image objects" on storage.objects;
create policy "Users can read own vehicle image objects"
  on storage.objects for select
  using (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can insert own vehicle image objects" on storage.objects;
create policy "Users can insert own vehicle image objects"
  on storage.objects for insert
  with check (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can delete own vehicle image objects" on storage.objects;
create policy "Users can delete own vehicle image objects"
  on storage.objects for delete
  using (
    bucket_id = 'vehicle-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
