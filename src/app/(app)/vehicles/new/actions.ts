"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ACQUISITION_SUBTYPE_OPTIONS,
  ACQUISITION_SUBTYPE_SET,
  ACQUISITION_TYPE_SET,
  BODY_STYLE_SET,
  DRIVE_TYPE_SET,
  TRANSMISSION_SET,
  VEHICLE_TYPE_SET,
  parsePositiveInteger,
  parsePositiveMoney,
} from "@/lib/vehicle-market";
import { canAddVehicle } from "@/lib/utils";
import type { AcquisitionType, FuelType, UserProfile } from "@/types/domain";

const VALID_FUEL_TYPES = new Set<string>([
  "petrol", "diesel", "electric", "hybrid", "lpg", "cng",
]);

const MAX_MILEAGE = 9999999;
const EARLIEST_SERIES_CAR_YEAR = 1886;

function isMissingEnginePowerPsColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }

  const message = (error.message ?? "").toLowerCase();
  return error.code === "42703" && message.includes("engine_power_ps");
}

function validateYear(yearInput: string): string | null {
  if (!yearInput.trim()) {
    return "Bitte ein Baujahr eingeben.";
  }

  if (!/^\d{4}$/.test(yearInput.trim())) {
    return "Bitte ein vierstelliges Baujahr eingeben.";
  }

  const year = Number.parseInt(yearInput, 10);
  const currentYear = new Date().getFullYear();

  if (year < EARLIEST_SERIES_CAR_YEAR) {
    return "Das Baujahr liegt vor der automobilen Serienproduktion.";
  }

  if (year > currentYear + 2) {
    return "Das Baujahr liegt unplausibel weit in der Zukunft.";
  }

  return null;
}

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
  const enginePowerPsStr = ((formData.get("engine_power_ps") as string) ?? "").trim();
  const engineDisplacementCcStr = formData.get("engine_displacement_cc") as string;
  const specialEquipment = ((formData.get("special_equipment") as string) ?? "").trim() || null;
  const catalogSource = ((formData.get("catalog_source") as string) ?? "").trim() || null;
  const acquisitionTypeRaw = ((formData.get("acquisition_type") as string) ?? "purchase").trim();
  const acquisitionSubtypeRaw = ((formData.get("acquisition_subtype") as string) ?? "").trim();
  const downPaymentStr = ((formData.get("down_payment") as string) ?? "").trim();
  const monthlyPaymentStr = ((formData.get("monthly_payment") as string) ?? "").trim();
  const termMonthsStr = ((formData.get("term_months") as string) ?? "").trim();
  const finalPaymentStr = ((formData.get("final_payment") as string) ?? "").trim();
  const contractStartDateStr = ((formData.get("contract_start_date") as string) ?? "").trim();
  const purchasePriceStr = ((formData.get("purchase_price") as string) ?? "").trim();
  const purchaseDateStr = ((formData.get("purchase_date") as string) ?? "").trim();
  const licensePlate = (formData.get("license_plate") as string)?.trim();
  const mileageStr = formData.get("current_mileage") as string;

  if (!make || !model || !fuelType || !licensePlate || !mileageStr) {
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  }

  const acquisitionType = (ACQUISITION_TYPE_SET.has(acquisitionTypeRaw as AcquisitionType)
    ? acquisitionTypeRaw
    : "purchase") as AcquisitionType;
  const acquisitionSubtype = acquisitionSubtypeRaw || null;

  const year = parseInt(yearStr, 10);
  const currentMileage = parseInt(mileageStr, 10);
  const doors = doorsStr ? parseInt(doorsStr, 10) : null;
  const parsedKw = enginePowerKwStr ? parseInt(enginePowerKwStr, 10) : null;
  const parsedPs = enginePowerPsStr ? parseInt(enginePowerPsStr, 10) : null;
  const enginePowerPs = parsedPs;
  const enginePowerKw = parsedKw;
  const engineDisplacementCc = engineDisplacementCcStr ? parseInt(engineDisplacementCcStr, 10) : null;
  const purchasePrice = parsePositiveMoney(purchasePriceStr);
  const downPayment = parsePositiveMoney(downPaymentStr);
  const monthlyPayment = parsePositiveMoney(monthlyPaymentStr);
  const termMonths = parsePositiveInteger(termMonthsStr);
  const finalPayment = parsePositiveMoney(finalPaymentStr);
  const contractStartDate = contractStartDateStr || null;
  const purchaseDate = purchaseDateStr || null;

  const yearValidationError = validateYear(yearStr);
  if (yearValidationError) {
    return { error: yearValidationError };
  }

  if (isNaN(currentMileage) || currentMileage < 0 || currentMileage > MAX_MILEAGE) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben." };
  }

  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return { error: "Bitte eine gültige VIN mit 17 Zeichen eingeben." };
  }

  if (vehicleType && !VEHICLE_TYPE_SET.has(vehicleType)) {
    return { error: "Bitte einen gültigen Fahrzeugtyp auswählen." };
  }

  if (bodyStyle && !BODY_STYLE_SET.has(bodyStyle)) {
    return { error: "Bitte eine gültige Karosserieform auswählen." };
  }

  if (transmission && !TRANSMISSION_SET.has(transmission)) {
    return { error: "Bitte ein gültiges Getriebe auswählen." };
  }

  if (driveType && !DRIVE_TYPE_SET.has(driveType)) {
    return { error: "Bitte einen gültigen Antrieb auswählen." };
  }

  if (doors !== null && (isNaN(doors) || doors < 1 || doors > 9)) {
    return { error: "Bitte eine gültige Türen-Anzahl eingeben." };
  }

  if (enginePowerKw !== null && (isNaN(enginePowerKw) || enginePowerKw < 0 || enginePowerKw > 2000)) {
    return { error: "Bitte eine gültige Leistung in kW eingeben." };
  }

  if (enginePowerPs !== null && (isNaN(enginePowerPs) || enginePowerPs < 0 || enginePowerPs > 3000)) {
    return { error: "Bitte eine gültige Leistung in PS eingeben." };
  }

  if (
    engineDisplacementCc !== null &&
    (isNaN(engineDisplacementCc) || engineDisplacementCc < 0 || engineDisplacementCc > 20000)
  ) {
    return { error: "Bitte einen gültigen Hubraum in ccm eingeben." };
  }

  if (purchasePriceStr && purchasePrice === null) {
    return { error: "Bitte einen gültigen Kaufpreis eingeben." };
  }

  if (downPaymentStr && downPayment === null) {
    return { error: "Bitte eine gültige Anzahlung eingeben." };
  }

  if (monthlyPaymentStr && monthlyPayment === null) {
    return { error: "Bitte eine gültige Monatsrate eingeben." };
  }

  if (termMonthsStr && termMonths === null) {
    return { error: "Bitte eine gültige Vertragslaufzeit in Monaten eingeben." };
  }

  if (finalPaymentStr && finalPayment === null) {
    return { error: "Bitte eine gültige Schlussrate eingeben." };
  }

  if (purchaseDate && Number.isNaN(Date.parse(purchaseDate))) {
    return { error: "Bitte ein gültiges Kaufdatum eingeben." };
  }

  if (contractStartDate && Number.isNaN(Date.parse(contractStartDate))) {
    return { error: "Bitte ein gültiges Vertragsstartdatum eingeben." };
  }

  if (acquisitionSubtype && !ACQUISITION_SUBTYPE_SET.has(acquisitionSubtype as never)) {
    return { error: "Bitte eine gültige Erwerbsoption auswählen." };
  }

  const allowedSubtypes = ACQUISITION_SUBTYPE_OPTIONS[acquisitionType].map((entry) => entry.value);
  if (!acquisitionSubtype || !allowedSubtypes.includes(acquisitionSubtype as never)) {
    return { error: "Bitte eine passende Unteroption für die Erwerbsart auswählen." };
  }

  if ((acquisitionType === "finance" || acquisitionType === "lease") && (monthlyPayment === null || termMonths === null)) {
    return { error: "Bitte Monatsrate und Laufzeit für Finanzierung oder Leasing ausfüllen." };
  }

  const normalizedPurchasePrice =
    acquisitionType === "purchase"
      ? purchasePrice
      : (downPayment ?? 0) + (monthlyPayment ?? 0) * (termMonths ?? 0) + (finalPayment ?? 0);

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

  const insertPayload = {
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
    engine_power_ps: enginePowerPs,
    engine_displacement_cc: engineDisplacementCc,
    special_equipment: specialEquipment,
    catalog_source: catalogSource,
    acquisition_type: acquisitionType,
    acquisition_subtype: acquisitionSubtype,
    down_payment: downPayment,
    monthly_payment: monthlyPayment,
    term_months: termMonths,
    final_payment: finalPayment,
    contract_start_date: contractStartDate,
    purchase_price: normalizedPurchasePrice,
    purchase_date: purchaseDate,
    license_plate: licensePlate,
    current_mileage: currentMileage,
  };

  let { error } = await supabase.from("vehicles").insert(insertPayload);

  if (isMissingEnginePowerPsColumnError(error)) {
    const { engine_power_ps: ignoredEnginePowerPs, ...fallbackPayload } = insertPayload;
    void ignoredEnginePowerPs;
    const retry = await supabase.from("vehicles").insert(fallbackPayload);
    error = retry.error;
  }

  if (error) {
    return { error: "Fehler beim Speichern. Bitte versuche es erneut." };
  }

  redirect("/vehicles");
}


