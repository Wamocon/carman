alter table public.vehicle_images
  add column if not exists is_primary boolean not null default false;

create unique index if not exists idx_vehicle_images_one_primary_per_vehicle
  on public.vehicle_images(vehicle_id)
  where is_primary = true;

with ranked_images as (
  select
    id,
    row_number() over (partition by vehicle_id order by created_at desc, id desc) as row_num
  from public.vehicle_images
)
update public.vehicle_images target
set is_primary = true
from ranked_images ranked
where target.id = ranked.id
  and ranked.row_num = 1
  and not exists (
    select 1
    from public.vehicle_images existing
    where existing.vehicle_id = target.vehicle_id
      and existing.is_primary = true
  );

alter table public.cost_entries
  add column if not exists reminder_id uuid references public.reminders(id) on delete set null;

create index if not exists idx_cost_entries_reminder
  on public.cost_entries(reminder_id);

alter table public.reminders
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at
  before update on public.reminders
  for each row execute procedure public.set_updated_at();

update public.reminders
set completed_at = coalesce(completed_at, created_at)
where is_completed = true
  and completed_at is null;