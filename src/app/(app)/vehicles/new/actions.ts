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
  const vin = ((formData.get("vin") as string) ?? "").trim().toUpperCase() || null;
  const make = (formData.get("make") as string)?.trim();
  const model = (formData.get("model") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const fuelType = formData.get("fuel_type") as string;
  const vehicleType = ((formData.get("vehicle_type") as string) ?? "").trim() || null;
  const bodyStyle = ((formData.get("body_style") as string) ?? "").trim() || null;
  const variant = ((formData.get("variant") as string) ?? "").trim() || null;
  const engineDescription = ((formData.get("engine_description") as string) ?? "").trim() || null;
  const transmission = ((formData.get("transmission") as string) ?? "").trim() || null;
  const driveType = ((formData.get("drive_type") as string) ?? "").trim() || null;
  const doorsStr = formData.get("doors") as string;
  const enginePowerKwStr = formData.get("engine_power_kw") as string;
  const engineDisplacementCcStr = formData.get("engine_displacement_cc") as string;
  const specialEquipment = ((formData.get("special_equipment") as string) ?? "").trim() || null;
  const catalogSource = ((formData.get("catalog_source") as string) ?? "").trim() || null;
  const purchasePriceStr = ((formData.get("purchase_price") as string) ?? "").trim();
  const purchaseDateStr = ((formData.get("purchase_date") as string) ?? "").trim();
  const licensePlate = (formData.get("license_plate") as string)?.trim();
  const mileageStr = formData.get("current_mileage") as string;

  if (!make || !model || !yearStr || !fuelType || !licensePlate || !mileageStr) {
    return { error: "Bitte alle Felder ausfällen." };
  }

  const year = parseInt(yearStr, 10);
  const currentMileage = parseInt(mileageStr, 10);
  const doors = doorsStr ? parseInt(doorsStr, 10) : null;
  const enginePowerKw = enginePowerKwStr ? parseInt(enginePowerKwStr, 10) : null;
  const engineDisplacementCc = engineDisplacementCcStr ? parseInt(engineDisplacementCcStr, 10) : null;
  const purchasePrice = purchasePriceStr ? Number(purchasePriceStr.replace(",", ".")) : null;
  const purchaseDate = purchaseDateStr || null;
  const maxYear = new Date().getFullYear() + 1;

  if (isNaN(year) || year < 1900 || year > maxYear) {
    return { error: "Bitte ein gültiges Baujahr eingeben." };
  }

  if (isNaN(currentMileage) || currentMileage < 0 || currentMileage > MAX_MILEAGE) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben." };
  }

  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return { error: "Bitte eine gueltige VIN mit 17 Zeichen eingeben." };
  }

  if (doors !== null && (isNaN(doors) || doors < 1 || doors > 9)) {
    return { error: "Bitte eine gueltige Tueren-Anzahl eingeben." };
  }

  if (enginePowerKw !== null && (isNaN(enginePowerKw) || enginePowerKw < 0 || enginePowerKw > 2000)) {
    return { error: "Bitte eine gueltige Leistung in kW eingeben." };
  }

  if (
    engineDisplacementCc !== null &&
    (isNaN(engineDisplacementCc) || engineDisplacementCc < 0 || engineDisplacementCc > 20000)
  ) {
    return { error: "Bitte einen gueltigen Hubraum in ccm eingeben." };
  }

  if (purchasePrice !== null && (!Number.isFinite(purchasePrice) || purchasePrice < 0)) {
    return { error: "Bitte einen gueltigen Kaufpreis eingeben." };
  }

  if (purchaseDate && Number.isNaN(Date.parse(purchaseDate))) {
    return { error: "Bitte ein gueltiges Kaufdatum eingeben." };
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
    vin,
    make,
    model,
    year,
    fuel_type: fuelType as FuelType,
    vehicle_type: vehicleType,
    body_style: bodyStyle,
    variant,
    engine_description: engineDescription,
    transmission,
    drive_type: driveType,
    doors,
    engine_power_kw: enginePowerKw,
    engine_displacement_cc: engineDisplacementCc,
    special_equipment: specialEquipment,
    catalog_source: catalogSource,
    purchase_price: purchasePrice,
    purchase_date: purchaseDate,
    license_plate: licensePlate,
    current_mileage: currentMileage,
  });

  if (error) {
    return { error: "Fehler beim Speichern. Bitte versuche es erneut." };
  }

  redirect("/vehicles");
}


