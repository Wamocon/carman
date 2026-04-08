"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAddVehicle } from "@/lib/utils";
import type { FuelType, UserProfile } from "@/types/domain";

const VALID_FUEL_TYPES = new Set<string>([
  "petrol", "diesel", "electric", "hybrid", "lpg", "cng",
]);

const MAX_MILEAGE = 9999999;

export async function createVehicle(
  _prevState: { error: string | null },
  formData: FormData,
) {
  const make = (formData.get("make") as string)?.trim();
  const model = (formData.get("model") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const fuelType = formData.get("fuel_type") as string;
  const licensePlate = (formData.get("license_plate") as string)?.trim();
  const mileageStr = formData.get("current_mileage") as string;

  if (!make || !model || !yearStr || !fuelType || !licensePlate || !mileageStr) {
    return { error: "Bitte alle Felder ausfüllen." };
  }

  const year = parseInt(yearStr, 10);
  const currentMileage = parseInt(mileageStr, 10);
  const maxYear = new Date().getFullYear() + 1;

  if (isNaN(year) || year < 1900 || year > maxYear) {
    return { error: "Bitte ein gültiges Baujahr eingeben." };
  }

  if (isNaN(currentMileage) || currentMileage < 0 || currentMileage > MAX_MILEAGE) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben." };
  }

  if (!VALID_FUEL_TYPES.has(fuelType)) {
    return { error: "Ungültiger Kraftstofftyp." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  // Check vehicle limit
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const userProfile = profile as UserProfile | null;
  const tier = userProfile?.subscription_tier ?? "free";

  if (!canAddVehicle(tier, count ?? 0)) {
    return { error: "Fahrzeuglimit erreicht. Bitte upgrade auf Pro." };
  }

  const { error } = await supabase.from("vehicles").insert({
    user_id: user.id,
    make,
    model,
    year,
    fuel_type: fuelType as FuelType,
    license_plate: licensePlate,
    current_mileage: currentMileage,
  });

  if (error) {
    return { error: "Fehler beim Speichern. Bitte versuche es erneut." };
  }

  redirect("/vehicles");
}
