"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CostCategory } from "@/types/domain";

const VALID_CATEGORIES = new Set<string>([
  "fuel", "maintenance", "repair", "insurance", "tax", "leasing", "parking", "other",
]);

export async function createCostEntry(
  _prevState: { error: string | null },
  formData: FormData,
) {
  const vehicleId = formData.get("vehicle_id") as string;
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
  if (isNaN(amount) || amount < 0) {
    return { error: "Bitte einen gültigen Betrag eingeben." };
  }

  const mileage = mileageStr ? parseInt(mileageStr, 10) : null;
  if (mileage !== null && (isNaN(mileage) || mileage < 0)) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben." };
  }

  const liters = litersStr ? parseFloat(litersStr) : null;
  const pricePerLiter = pplStr ? parseFloat(pplStr) : null;

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
