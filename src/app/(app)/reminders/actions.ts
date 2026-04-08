"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReminderType } from "@/types/domain";

const VALID_TYPES = new Set<string>(["date", "mileage", "both"]);
const MAX_MILEAGE = 9999999;

export async function toggleReminder(reminderId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("reminders")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", reminderId)
    .eq("user_id", user.id);

  revalidatePath("/reminders");
  revalidatePath("/servicetermine");
  revalidatePath(`/reminders/${reminderId}`);
  revalidatePath(`/servicetermine/${reminderId}`);
}

export async function updateReminder(
  _prevState: { error: string | null; success: string | null },
  formData: FormData,
) {
  const reminderId = (formData.get("reminder_id") as string) ?? "";
  const vehicleId = (formData.get("vehicle_id") as string) ?? "";
  const title = ((formData.get("title") as string) ?? "").trim();
  const reminderType = (formData.get("reminder_type") as string) ?? "";
  const dueDate = ((formData.get("due_date") as string) ?? "").trim() || null;
  const dueMileageStr = ((formData.get("due_mileage") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;
  const isCompleted = formData.get("is_completed") === "true";

  if (!reminderId || !vehicleId || !title || !VALID_TYPES.has(reminderType)) {
    return { error: "Bitte alle Pflichtfelder ausfüllen.", success: null };
  }

  const dueMileage = dueMileageStr ? Number.parseInt(dueMileageStr, 10) : null;
  if (dueMileage !== null && (Number.isNaN(dueMileage) || dueMileage < 0 || dueMileage > MAX_MILEAGE)) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben.", success: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null };
  }

  const { error } = await supabase
    .from("reminders")
    .update({
      vehicle_id: vehicleId,
      title,
      reminder_type: reminderType as ReminderType,
      due_date: dueDate,
      due_mileage: dueMileage,
      notes,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", reminderId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Servicetermin konnte nicht aktualisiert werden.", success: null };
  }

  revalidatePath("/reminders");
  revalidatePath("/servicetermine");
  revalidatePath(`/reminders/${reminderId}`);
  revalidatePath(`/servicetermine/${reminderId}`);
  revalidatePath(`/vehicles/${vehicleId}`);

  return { error: null, success: "Servicetermin aktualisiert." };
}

export async function linkReminderToCost(
  _prevState: { error: string | null; success: string | null },
  formData: FormData,
) {
  const reminderId = (formData.get("reminder_id") as string) ?? "";
  const costEntryId = (formData.get("cost_entry_id") as string) ?? "";

  if (!reminderId || !costEntryId) {
    return { error: "Bitte einen Kosteneintrag auswählen.", success: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null };
  }

  const { data: reminder, error: reminderError } = await supabase
    .from("reminders")
    .select("id, vehicle_id")
    .eq("id", reminderId)
    .eq("user_id", user.id)
    .single();

  if (reminderError || !reminder) {
    return { error: "Servicetermin nicht gefunden.", success: null };
  }

  const { data: costEntry, error: costError } = await supabase
    .from("cost_entries")
    .select("id, vehicle_id")
    .eq("id", costEntryId)
    .eq("user_id", user.id)
    .single();

  if (costError || !costEntry || costEntry.vehicle_id !== reminder.vehicle_id) {
    return { error: "Der Kosteneintrag passt nicht zu diesem Fahrzeug.", success: null };
  }

  const { error } = await supabase
    .from("cost_entries")
    .update({ reminder_id: reminderId })
    .eq("id", costEntryId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Kosteneintrag konnte nicht verknüpft werden.", success: null };
  }

  await supabase
    .from("reminders")
    .update({ is_completed: true, completed_at: new Date().toISOString() })
    .eq("id", reminderId)
    .eq("user_id", user.id);

  revalidatePath("/reminders");
  revalidatePath("/servicetermine");
  revalidatePath(`/reminders/${reminderId}`);
  revalidatePath(`/servicetermine/${reminderId}`);
  revalidatePath(`/vehicles/${reminder.vehicle_id}`);
  revalidatePath(`/costs/${costEntryId}`);

  return { error: null, success: "Kosteneintrag wurde verknüpft." };
}

export async function submitLinkReminderToCost(formData: FormData) {
  await linkReminderToCost({ error: null, success: null }, formData);
}

