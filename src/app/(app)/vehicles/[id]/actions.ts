"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CostCategory } from "@/types/domain";

const MAX_AMOUNT = 999999.99;
const MAX_CONSUMPTION_PER_100KM = 999.999;
const MAX_DISTANCE_PER_MONTH_KM = 1000000;
const MAX_ENERGY_PRICE_PER_UNIT = 999.999;
const PERIODS = new Set(["month", "quarter", "year"] as const);

type StandardPeriod = "month" | "quarter" | "year";

const VALID_FUEL_TYPES = new Set(["petrol", "diesel", "electric", "hybrid", "lpg", "cng"]);

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Fehler beim Löschen. Bitte versuche es erneut." };
  }

  return { error: null };
}

export async function createVehicleStandardCostsForPeriods(formData: FormData) {
  const vehicleId = (formData.get("vehicle_id") as string) ?? "";
  const date = (formData.get("date") as string) ?? "";
  const consumptionStr = (formData.get("consumption_per_100km") as string) ?? "";
  const distanceStr = (formData.get("distance_per_month_km") as string) ?? "";
  const energyPriceStr = (formData.get("energy_price_per_unit") as string) ?? "";
  const periodsRaw = formData.getAll("periods");

  if (!vehicleId || !date || !consumptionStr || !distanceStr || !energyPriceStr) {
    return { error: "Bitte alle Felder für den Standard-Kostenrechner ausfällen." };
  }

  const periods = periodsRaw
    .filter((period): period is string => typeof period === "string")
    .filter((period): period is StandardPeriod => PERIODS.has(period as StandardPeriod));

  if (periods.length === 0) {
    return { error: "Bitte mindestens einen Zeitraum auswählen." };
  }

  const consumption = Number.parseFloat(consumptionStr);
  const distance = Number.parseFloat(distanceStr);
  const energyPrice = Number.parseFloat(energyPriceStr);

  if (
    Number.isNaN(consumption) ||
    consumption <= 0 ||
    consumption > MAX_CONSUMPTION_PER_100KM
  ) {
    return { error: "Bitte einen gültigen Standard-Verbrauch eingeben." };
  }

  if (Number.isNaN(distance) || distance < 0 || distance > MAX_DISTANCE_PER_MONTH_KM) {
    return { error: "Bitte eine gültige Standard-Strecke eingeben." };
  }

  if (
    Number.isNaN(energyPrice) ||
    energyPrice < 0 ||
    energyPrice > MAX_ENERGY_PRICE_PER_UNIT
  ) {
    return { error: "Bitte einen gültigen Standard-Energiepreis eingeben." };
  }

  const monthlyCost = (distance / 100) * consumption * energyPrice;
  const periodAmountMap: Record<StandardPeriod, number> = {
    month: monthlyCost,
    quarter: monthlyCost * 3,
    year: monthlyCost * 12,
  };

  if (Object.values(periodAmountMap).some((amount) => amount < 0 || amount > MAX_AMOUNT)) {
    return { error: "Die berechneten Kosten liegen außerhalb des erlaubten Bereichs." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    return { error: "Fahrzeug nicht gefunden oder keine Berechtigung." };
  }

  const periodLabel: Record<StandardPeriod, string> = {
    month: "Monat",
    quarter: "Quartal",
    year: "Jahr",
  };

  const inserts = periods.map((period) => ({
    vehicle_id: vehicleId,
    user_id: user.id,
    category: "fuel" as CostCategory,
    title: `Standardkosten (${periodLabel[period]})`,
    amount: Number(periodAmountMap[period].toFixed(2)),
    date,
    notes: "Automatisch aus fahrzeugspezifischem Standard-Kostenrechner übernommen.",
  }));

  const { error } = await supabase.from("cost_entries").insert(inserts);
  if (error) {
    return { error: "Die Standardkosten konnten nicht gespeichert werden." };
  }

  return {
    error: null,
    message: `${inserts.length} Eintrag${inserts.length === 1 ? "" : "e"} wurde${inserts.length === 1 ? "" : "n"} erstellt.`,
  };
}

export async function updateVehicleProfile(
  _prevState: { error: string | null; success: string | null },
  formData: FormData,
) {
  const vehicleId = (formData.get("vehicle_id") as string) ?? "";
  const make = ((formData.get("make") as string) ?? "").trim();
  const model = ((formData.get("model") as string) ?? "").trim();
  const yearStr = ((formData.get("year") as string) ?? "").trim();
  const fuelType = ((formData.get("fuel_type") as string) ?? "").trim();
  const licensePlate = ((formData.get("license_plate") as string) ?? "").trim();
  const mileageStr = ((formData.get("current_mileage") as string) ?? "").trim();
  const vin = ((formData.get("vin") as string) ?? "").trim() || null;
  const vehicleType = ((formData.get("vehicle_type") as string) ?? "").trim() || null;
  const bodyStyle = ((formData.get("body_style") as string) ?? "").trim() || null;
  const variant = ((formData.get("variant") as string) ?? "").trim() || null;
  const engineDescription = ((formData.get("engine_description") as string) ?? "").trim() || null;
  const transmission = ((formData.get("transmission") as string) ?? "").trim() || null;
  const driveType = ((formData.get("drive_type") as string) ?? "").trim() || null;
  const doorsStr = ((formData.get("doors") as string) ?? "").trim();
  const enginePowerKwStr = ((formData.get("engine_power_kw") as string) ?? "").trim();
  const engineDisplacementCcStr = ((formData.get("engine_displacement_cc") as string) ?? "").trim();
  const specialEquipment = ((formData.get("special_equipment") as string) ?? "").trim() || null;
  const purchasePriceStr = ((formData.get("purchase_price") as string) ?? "").trim();
  const purchaseDate = ((formData.get("purchase_date") as string) ?? "").trim() || null;

  if (!vehicleId || !make || !model || !yearStr || !fuelType || !licensePlate || !mileageStr) {
    return { error: "Bitte alle Pflichtfelder ausfüllen.", success: null };
  }

  const year = Number.parseInt(yearStr, 10);
  const currentMileage = Number.parseInt(mileageStr, 10);
  const doors = doorsStr ? Number.parseInt(doorsStr, 10) : null;
  const enginePowerKw = enginePowerKwStr ? Number.parseInt(enginePowerKwStr, 10) : null;
  const engineDisplacementCc = engineDisplacementCcStr ? Number.parseInt(engineDisplacementCcStr, 10) : null;
  const purchasePrice = purchasePriceStr ? Number.parseFloat(purchasePriceStr.replace(",", ".")) : null;

  const maxYear = new Date().getFullYear() + 1;
  if (Number.isNaN(year) || year < 1900 || year > maxYear) {
    return { error: "Bitte ein gültiges Baujahr eingeben.", success: null };
  }

  if (Number.isNaN(currentMileage) || currentMileage < 0 || currentMileage > 9999999) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben.", success: null };
  }

  if (!VALID_FUEL_TYPES.has(fuelType)) {
    return { error: "Bitte einen gültigen Kraftstoff wählen.", success: null };
  }

  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin.toUpperCase())) {
    return { error: "Bitte eine gültige VIN eingeben.", success: null };
  }

  if (doors !== null && (Number.isNaN(doors) || doors < 1 || doors > 9)) {
    return { error: "Bitte eine gültige Türen-Anzahl eingeben.", success: null };
  }

  if (enginePowerKw !== null && (Number.isNaN(enginePowerKw) || enginePowerKw < 0 || enginePowerKw > 2000)) {
    return { error: "Bitte eine gültige Leistung eingeben.", success: null };
  }

  if (
    engineDisplacementCc !== null &&
    (Number.isNaN(engineDisplacementCc) || engineDisplacementCc < 0 || engineDisplacementCc > 20000)
  ) {
    return { error: "Bitte einen gültigen Hubraum eingeben.", success: null };
  }

  if (purchasePrice !== null && (!Number.isFinite(purchasePrice) || purchasePrice < 0)) {
    return { error: "Bitte einen gültigen Kaufpreis eingeben.", success: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({
      make,
      model,
      year,
      fuel_type: fuelType,
      license_plate: licensePlate,
      current_mileage: currentMileage,
      vin: vin ? vin.toUpperCase() : null,
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
      purchase_price: purchasePrice,
      purchase_date: purchaseDate,
    })
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Fahrzeug konnte nicht aktualisiert werden.", success: null };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/vehicles");

  return { error: null, success: "Fahrzeugdaten aktualisiert." };
}

export async function addVehicleComment(
  _prevState: { error: string | null; success: string | null },
  formData: FormData,
) {
  const vehicleId = (formData.get("vehicle_id") as string) ?? "";
  const body = ((formData.get("body") as string) ?? "").trim();

  if (!vehicleId || !body) {
    return { error: "Bitte einen Kommentar eingeben.", success: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null };
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    return { error: "Fahrzeug nicht gefunden.", success: null };
  }

  const { error } = await supabase.from("vehicle_comments").insert({
    vehicle_id: vehicleId,
    user_id: user.id,
    body,
  });

  if (error) {
    return { error: "Kommentar konnte nicht gespeichert werden.", success: null };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  return { error: null, success: "Kommentar gespeichert." };
}

export async function createVehicleImageRecord(formData: FormData) {
  const vehicleId = (formData.get("vehicle_id") as string) ?? "";
  const storagePath = (formData.get("storage_path") as string) ?? "";
  const fileName = (formData.get("file_name") as string) ?? "";
  const mimeType = (formData.get("mime_type") as string) ?? "";
  const fileSizeRaw = (formData.get("file_size_bytes") as string) ?? "";
  const rightsConfirmed = (formData.get("rights_confirmed") as string) === "true";
  const caption = ((formData.get("caption") as string) ?? "").trim() || null;

  if (!vehicleId || !storagePath || !fileName || !mimeType || !fileSizeRaw) {
    return { error: "Unvollständige Bilddaten." };
  }

  const fileSizeBytes = Number.parseInt(fileSizeRaw, 10);
  if (Number.isNaN(fileSizeBytes) || fileSizeBytes <= 0) {
    return { error: "Ungültige Dateigröße." };
  }

  if (!rightsConfirmed) {
    return { error: "Bitte bestätige die Nutzungsrechte für das Bild." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const expectedPrefix = `${user.id}/${vehicleId}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return { error: "Ungültiger Speicherpfad." };
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    return { error: "Fahrzeug nicht gefunden." };
  }

  const { data: existingPrimary } = await supabase
    .from("vehicle_images")
    .select("id")
    .eq("vehicle_id", vehicleId)
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const { error } = await supabase.from("vehicle_images").insert({
    vehicle_id: vehicleId,
    user_id: user.id,
    storage_path: storagePath,
    file_name: fileName,
    mime_type: mimeType,
    file_size_bytes: fileSizeBytes,
    caption,
    is_primary: !existingPrimary,
  });

  if (error) {
    return { error: "Bild konnte nicht dokumentiert werden." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function setPrimaryVehicleImage(vehicleId: string, imageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: image, error: imageError } = await supabase
    .from("vehicle_images")
    .select("id, vehicle_id")
    .eq("id", imageId)
    .eq("vehicle_id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (imageError || !image) {
    return;
  }

  await supabase
    .from("vehicle_images")
    .update({ is_primary: false })
    .eq("vehicle_id", vehicleId)
    .eq("user_id", user.id);

  const { error } = await supabase
    .from("vehicle_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("vehicle_id", vehicleId)
    .eq("user_id", user.id);

  if (error) {
    return;
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
}
