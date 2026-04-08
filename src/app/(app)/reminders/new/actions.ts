"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ReminderType } from "@/types/domain";

const VALID_TYPES = new Set<string>(["date", "mileage", "both"]);
const MAX_MILEAGE = 9999999;

export async function createReminder(
  _prevState: { error: string | null },
  formData: FormData,
) {
  const vehicleId = formData.get("vehicle_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const reminderType = formData.get("reminder_type") as string;
  const dueDate = (formData.get("due_date") as string) || null;
  const dueMileageStr = formData.get("due_mileage") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!vehicleId || !title || !reminderType) {
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  }

  if (!VALID_TYPES.has(reminderType)) {
    return { error: "Ungültige Erinnerungsart." };
  }

  const dueMileage = dueMileageStr ? parseInt(dueMileageStr, 10) : null;

  if (dueMileage !== null && (isNaN(dueMileage) || dueMileage < 0 || dueMileage > MAX_MILEAGE)) {
    return { error: "Bitte einen gueltigen Kilometerstand eingeben (max. 7-stellig)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase.from("reminders").insert({
    vehicle_id: vehicleId,
    user_id: user.id,
    title,
    reminder_type: reminderType as ReminderType,
    due_date: dueDate,
    due_mileage: dueMileage,
    notes,
  });

  if (error) {
    return { error: "Fehler beim Speichern. Bitte versuche es erneut." };
  }

  redirect("/reminders");
}
