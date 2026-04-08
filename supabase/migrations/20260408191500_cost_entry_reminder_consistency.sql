-- Guard against linking a cost entry to a reminder from another vehicle or user.

create or replace function public.ensure_cost_entry_matches_reminder()
returns trigger
language plpgsql
as $$
declare
  reminder_vehicle_id uuid;
  reminder_user_id uuid;
begin
  if new.reminder_id is null then
    return new;
  end if;

  select vehicle_id, user_id
    into reminder_vehicle_id, reminder_user_id
  from public.reminders
  where id = new.reminder_id;

  if reminder_vehicle_id is null or reminder_user_id is null then
    raise exception 'Referenced reminder was not found.' using errcode = '23503';
  end if;

  if reminder_vehicle_id <> new.vehicle_id then
    raise exception 'Reminder vehicle and cost entry vehicle must match.' using errcode = '23514';
  end if;

  if reminder_user_id <> new.user_id then
    raise exception 'Reminder user and cost entry user must match.' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_cost_entry_reminder_consistency on public.cost_entries;

create trigger validate_cost_entry_reminder_consistency
before insert or update of vehicle_id, user_id, reminder_id
on public.cost_entries
for each row
execute function public.ensure_cost_entry_matches_reminder();