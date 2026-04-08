"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CostCategory } from "@/types/domain";

const VALID_CATEGORIES = new Set<string>([
  "fuel", "maintenance", "repair", "insurance", "tax", "leasing", "parking", "other",
]);

const MAX_AMOUNT = 999999.99;
const MAX_MILEAGE = 9999999;
const MAX_LITERS = 999.999;
const MAX_PRICE_PER_LITER = 99.999;

export async function createCostEntry(
  _prevState: { error: string | null },
  formData: FormData,
) {
  const vehicleId = formData.get("vehicle_id") as string;
  const reminderId = (formData.get("reminder_id") as string) || null;
  const category = formData.get("category") as string;
  const title = (formData.get("title") as string)?.trim();
  const amountStr = formData.get("amount") as string;
  const date = formData.get("date") as string;
  const mileageStr = formData.get("mileage") as string;
  const litersStr = formData.get("liters") as string;
  const pplStr = formData.get("price_per_liter") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!vehicleId || !category || !title || !amountStr || !date) {
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  }

  if (!VALID_CATEGORIES.has(category)) {
    return { error: "Ungültige Kategorie." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount < 0 || amount > MAX_AMOUNT) {
    return { error: "Bitte einen gültigen Betrag eingeben." };
  }

  const mileage = mileageStr ? parseInt(mileageStr, 10) : null;
  if (mileage !== null && (isNaN(mileage) || mileage < 0 || mileage > MAX_MILEAGE)) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben." };
  }

  const liters = litersStr ? parseFloat(litersStr) : null;
  const pricePerLiter = pplStr ? parseFloat(pplStr) : null;

  if (liters !== null && (isNaN(liters) || liters < 0 || liters > MAX_LITERS)) {
    return { error: "Bitte gueltige Liter eingeben (max. 999.999)." };
  }

  if (
    pricePerLiter !== null &&
    (isNaN(pricePerLiter) || pricePerLiter < 0 || pricePerLiter > MAX_PRICE_PER_LITER)
  ) {
    return { error: "Bitte einen gueltigen Preis je Liter eingeben." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase.from("cost_entries").insert({
    vehicle_id: vehicleId,
    user_id: user.id,
    reminder_id: reminderId,
    category: category as CostCategory,
    title,
    amount,
    date,
    mileage,
    liters,
    price_per_liter: pricePerLiter,
    notes,
  });

  if (error) {
    return { error: "Fehler beim Speichern. Bitte versuche es erneut." };
  }

  if (reminderId) {
    await supabase
      .from("reminders")
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq("id", reminderId)
      .eq("user_id", user.id)
      .eq("vehicle_id", vehicleId);
  }

  // Update vehicle mileage if new mileage is higher
  if (mileage !== null) {
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("current_mileage")
      .eq("id", vehicleId)
      .single();

    if (vehicle && mileage > vehicle.current_mileage) {
      await supabase
        .from("vehicles")
        .update({ current_mileage: mileage })
        .eq("id", vehicleId);
    }
  }

  redirect("/costs");
}


