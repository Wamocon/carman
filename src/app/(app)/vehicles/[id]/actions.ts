"use server";

import { revalidatePath } from "next/cache";
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
import { DEFAULT_VEHICLE_STATUS, VEHICLE_STATUS } from "@/lib/vehicle-status";
import type { CostCategory } from "@/types/domain";

const MAX_AMOUNT = 999999.99;
const MAX_CONSUMPTION_PER_100KM = 999.999;
const MAX_DISTANCE_PER_MONTH_KM = 1000000;
const MAX_ENERGY_PRICE_PER_UNIT = 999.999;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_INVOICE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const PERIODS = new Set(["month", "quarter", "year"] as const);

type StandardPeriod = "month" | "quarter" | "year";

const VALID_FUEL_TYPES = new Set(["petrol", "diesel", "electric", "hybrid", "lpg", "cng"]);
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

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

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

  revalidatePath("/vehicles");
  revalidatePath("/costs");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cost-trend");
  revalidatePath("/dashboard/category-mix");
  revalidatePath("/servicetermine");

  return { error: null };
}

export async function sellVehicle(
  _prevState: { error: string | null; success: string | null; saleCostEntryId: string | null },
  formData: FormData,
) {
  const vehicleId = ((formData.get("vehicle_id") as string) ?? "").trim();
  const salePriceRaw = ((formData.get("sale_price") as string) ?? "").trim();
  const saleDate = ((formData.get("sale_date") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;
  const invoiceNumber = ((formData.get("invoice_number") as string) ?? "").trim() || null;
  const invoiceDate = ((formData.get("invoice_date") as string) ?? "").trim() || null;
  const invoiceNote = ((formData.get("invoice_note") as string) ?? "").trim() || null;
  const invoiceFile = formData.get("invoice_file");

  if (!vehicleId || !salePriceRaw || !saleDate) {
    return {
      error: "Bitte Verkaufspreis und Verkaufsdatum eingeben.",
      success: null,
      saleCostEntryId: null,
    };
  }

  const salePrice = Number.parseFloat(salePriceRaw.replace(",", "."));
  if (Number.isNaN(salePrice) || salePrice <= 0 || salePrice > MAX_AMOUNT) {
    return {
      error: "Bitte einen gültigen Verkaufspreis eingeben.",
      success: null,
      saleCostEntryId: null,
    };
  }

  if (Number.isNaN(Date.parse(saleDate))) {
    return {
      error: "Bitte ein gültiges Verkaufsdatum eingeben.",
      success: null,
      saleCostEntryId: null,
    };
  }

  const hasInvoiceFile = invoiceFile instanceof File && invoiceFile.size > 0;
  if (hasInvoiceFile) {
    if (!ALLOWED_INVOICE_TYPES.has(invoiceFile.type)) {
      return {
        error: "Für den Verkaufsbeleg sind nur PDF, PNG, JPG und WEBP erlaubt.",
        success: null,
        saleCostEntryId: null,
      };
    }

    if (invoiceFile.size > MAX_FILE_SIZE_BYTES) {
      return {
        error: "Der Verkaufsbeleg ist zu groß (max. 10 MB).",
        success: null,
        saleCostEntryId: null,
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null, saleCostEntryId: null };
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, status, sale_cost_entry_id")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    return { error: "Fahrzeug nicht gefunden.", success: null, saleCostEntryId: null };
  }

  if (vehicle.status !== DEFAULT_VEHICLE_STATUS) {
    return {
      error: "Dieses Fahrzeug wurde bereits verkauft.",
      success: null,
      saleCostEntryId: vehicle.sale_cost_entry_id ?? null,
    };
  }

  const { data: saleEntry, error: saleEntryError } = await supabase
    .from("cost_entries")
    .insert({
      vehicle_id: vehicleId,
      user_id: user.id,
      category: "other" as CostCategory,
      title: "Fahrzeugverkauf",
      amount: Number((-salePrice).toFixed(2)),
      is_vehicle_sale: true,
      date: saleDate,
      notes,
    })
    .select("id")
    .single();

  if (saleEntryError || !saleEntry) {
    return {
      error: "Der Verkaufseintrag konnte nicht gespeichert werden.",
      success: null,
      saleCostEntryId: null,
    };
  }

  let uploadedInvoicePath: string | null = null;

  if (hasInvoiceFile) {
    const sanitizedName = sanitizeFileName(invoiceFile.name);
    const uniqueName = `${crypto.randomUUID()}-${sanitizedName}`;
    uploadedInvoicePath = `${user.id}/${saleEntry.id}/${uniqueName}`;
    const fileBuffer = new Uint8Array(await invoiceFile.arrayBuffer());

    const uploadResult = await supabase.storage
      .from("cost-invoices")
      .upload(uploadedInvoicePath, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: invoiceFile.type,
      });

    if (uploadResult.error) {
      await supabase.from("cost_entries").delete().eq("id", saleEntry.id).eq("user_id", user.id);
      return {
        error: "Der Verkaufsbeleg konnte nicht hochgeladen werden.",
        success: null,
        saleCostEntryId: null,
      };
    }

    const { error: invoiceError } = await supabase.from("cost_invoices").insert({
      cost_entry_id: saleEntry.id,
      user_id: user.id,
      storage_path: uploadedInvoicePath,
      file_name: invoiceFile.name,
      mime_type: invoiceFile.type,
      file_size_bytes: invoiceFile.size,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      note: invoiceNote,
    });

    if (invoiceError) {
      await supabase.storage.from("cost-invoices").remove([uploadedInvoicePath]);
      await supabase.from("cost_entries").delete().eq("id", saleEntry.id).eq("user_id", user.id);
      return {
        error: "Der Verkaufsbeleg konnte nicht dokumentiert werden.",
        success: null,
        saleCostEntryId: null,
      };
    }
  }

  const soldAt = new Date(`${saleDate}T12:00:00.000Z`).toISOString();
  const { error: updateVehicleError } = await supabase
    .from("vehicles")
    .update({
      status: VEHICLE_STATUS.sold,
      sold_at: soldAt,
      sale_cost_entry_id: saleEntry.id,
    })
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (updateVehicleError) {
    if (uploadedInvoicePath) {
      await supabase.storage.from("cost-invoices").remove([uploadedInvoicePath]);
      await supabase.from("cost_invoices").delete().eq("cost_entry_id", saleEntry.id).eq("user_id", user.id);
    }

    await supabase.from("cost_entries").delete().eq("id", saleEntry.id).eq("user_id", user.id);

    return {
      error: "Das Fahrzeug konnte nicht als verkauft markiert werden.",
      success: null,
      saleCostEntryId: null,
    };
  }

  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath(`/vehicles/${vehicleId}/edit`);
  revalidatePath("/costs");
  revalidatePath(`/costs/${saleEntry.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cost-trend");
  revalidatePath("/dashboard/category-mix");
  revalidatePath("/servicetermine");
  revalidatePath("/export");

  return {
    error: null,
    success: "Fahrzeug wurde verkauft und als Erlös verbucht.",
    saleCostEntryId: saleEntry.id,
  };
}

export async function createVehicleStandardCostsForPeriods(formData: FormData) {
  const vehicleId = (formData.get("vehicle_id") as string) ?? "";
  const date = (formData.get("date") as string) ?? "";
  const consumptionStr = (formData.get("consumption_per_100km") as string) ?? "";
  const distanceStr = (formData.get("distance_per_month_km") as string) ?? "";
  const energyPriceStr = (formData.get("energy_price_per_unit") as string) ?? "";
  const periodRaw = (formData.get("period") as string | null) ?? "";
  const periodsRaw = formData.getAll("periods");

  if (!vehicleId || !date || !consumptionStr || !distanceStr || !energyPriceStr) {
    return { error: "Bitte alle Felder für den Standard-Kostenrechner ausfällen." };
  }

  const periods = periodsRaw
    .filter((period): period is string => typeof period === "string")
    .filter((period): period is StandardPeriod => PERIODS.has(period as StandardPeriod));

  if (periods.length > 1) {
    return { error: "Bitte entweder Monat/Quartal oder Jahr auswählen." };
  }

  const period: StandardPeriod | null = PERIODS.has(periodRaw as StandardPeriod)
    ? (periodRaw as StandardPeriod)
    : periods[0] ?? null;

  if (!period) {
    return { error: "Bitte genau einen Zeitraum auswählen." };
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
  const periodMultiplier: Record<StandardPeriod, number> = {
    month: 1,
    quarter: 3,
    year: 12,
  };
  const litersOrKwh = Number(
    (((distance * periodMultiplier[period]) / 100) * consumption).toFixed(3),
  );

  const insert = {
    vehicle_id: vehicleId,
    user_id: user.id,
    category: "fuel" as CostCategory,
    title: `Standardkosten (${periodLabel[period]})`,
    amount: Number(periodAmountMap[period].toFixed(2)),
    liters: litersOrKwh,
    price_per_liter: Number(energyPrice.toFixed(3)),
    date,
    notes: "Automatisch aus fahrzeugspezifischem Standard-Kostenrechner übernommen.",
  };

  const { error } = await supabase.from("cost_entries").insert(insert);
  if (error) {
    return { error: "Die Standardkosten konnten nicht gespeichert werden." };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath("/costs");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cost-trend");

  return {
    error: null,
    message: "1 Eintrag wurde erstellt.",
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
  const enginePowerPsStr = ((formData.get("engine_power_ps") as string) ?? "").trim();
  const engineDisplacementCcStr = ((formData.get("engine_displacement_cc") as string) ?? "").trim();
  const specialEquipment = ((formData.get("special_equipment") as string) ?? "").trim() || null;
  const acquisitionTypeRaw = ((formData.get("acquisition_type") as string) ?? "purchase").trim();
  const acquisitionSubtypeRaw = ((formData.get("acquisition_subtype") as string) ?? "").trim();
  const downPaymentStr = ((formData.get("down_payment") as string) ?? "").trim();
  const monthlyPaymentStr = ((formData.get("monthly_payment") as string) ?? "").trim();
  const termMonthsStr = ((formData.get("term_months") as string) ?? "").trim();
  const finalPaymentStr = ((formData.get("final_payment") as string) ?? "").trim();
  const contractStartDate = ((formData.get("contract_start_date") as string) ?? "").trim() || null;
  const purchasePriceStr = ((formData.get("purchase_price") as string) ?? "").trim();
  const purchaseDate = ((formData.get("purchase_date") as string) ?? "").trim() || null;

  if (!vehicleId || !make || !model || !yearStr || !fuelType || !licensePlate || !mileageStr) {
    return { error: "Bitte alle Pflichtfelder ausfüllen.", success: null };
  }

  const year = Number.parseInt(yearStr, 10);
  const currentMileage = Number.parseInt(mileageStr, 10);
  const doors = doorsStr ? Number.parseInt(doorsStr, 10) : null;
  const parsedKw = enginePowerKwStr ? Number.parseInt(enginePowerKwStr, 10) : null;
  const parsedPs = enginePowerPsStr ? Number.parseInt(enginePowerPsStr, 10) : null;
  const enginePowerPs = parsedPs;
  const enginePowerKw = parsedKw;
  const engineDisplacementCc = engineDisplacementCcStr ? Number.parseInt(engineDisplacementCcStr, 10) : null;
  const purchasePrice = parsePositiveMoney(purchasePriceStr);
  const downPayment = parsePositiveMoney(downPaymentStr);
  const monthlyPayment = parsePositiveMoney(monthlyPaymentStr);
  const termMonths = parsePositiveInteger(termMonthsStr);
  const finalPayment = parsePositiveMoney(finalPaymentStr);
  const acquisitionType = ACQUISITION_TYPE_SET.has(acquisitionTypeRaw as never) ? acquisitionTypeRaw : "purchase";
  const acquisitionSubtype = acquisitionSubtypeRaw || null;

  const yearValidationError = validateYear(yearStr);
  if (yearValidationError) {
    return { error: yearValidationError, success: null };
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

  if (vehicleType && !VEHICLE_TYPE_SET.has(vehicleType)) {
    return { error: "Bitte einen gültigen Fahrzeugtyp auswählen.", success: null };
  }

  if (bodyStyle && !BODY_STYLE_SET.has(bodyStyle)) {
    return { error: "Bitte eine gültige Karosserieform auswählen.", success: null };
  }

  if (transmission && !TRANSMISSION_SET.has(transmission)) {
    return { error: "Bitte ein gültiges Getriebe auswählen.", success: null };
  }

  if (driveType && !DRIVE_TYPE_SET.has(driveType)) {
    return { error: "Bitte einen gültigen Antrieb auswählen.", success: null };
  }

  if (doors !== null && (Number.isNaN(doors) || doors < 1 || doors > 9)) {
    return { error: "Bitte eine gültige Türen-Anzahl eingeben.", success: null };
  }

  if (enginePowerKw !== null && (Number.isNaN(enginePowerKw) || enginePowerKw < 0 || enginePowerKw > 2000)) {
    return { error: "Bitte eine gültige Leistung eingeben.", success: null };
  }

  if (enginePowerPs !== null && (Number.isNaN(enginePowerPs) || enginePowerPs < 0 || enginePowerPs > 3000)) {
    return { error: "Bitte eine gültige Leistung in PS eingeben.", success: null };
  }

  if (
    engineDisplacementCc !== null &&
    (Number.isNaN(engineDisplacementCc) || engineDisplacementCc < 0 || engineDisplacementCc > 20000)
  ) {
    return { error: "Bitte einen gültigen Hubraum eingeben.", success: null };
  }

  if (purchasePriceStr && purchasePrice === null) {
    return { error: "Bitte einen gültigen Kaufpreis eingeben.", success: null };
  }

  if (downPaymentStr && downPayment === null) {
    return { error: "Bitte eine gültige Anzahlung eingeben.", success: null };
  }

  if (monthlyPaymentStr && monthlyPayment === null) {
    return { error: "Bitte eine gültige Monatsrate eingeben.", success: null };
  }

  if (termMonthsStr && termMonths === null) {
    return { error: "Bitte eine gültige Vertragslaufzeit in Monaten eingeben.", success: null };
  }

  if (finalPaymentStr && finalPayment === null) {
    return { error: "Bitte eine gültige Schlussrate eingeben.", success: null };
  }

  if (contractStartDate && Number.isNaN(Date.parse(contractStartDate))) {
    return { error: "Bitte ein gültiges Vertragsstartdatum eingeben.", success: null };
  }

  if (acquisitionSubtype && !ACQUISITION_SUBTYPE_SET.has(acquisitionSubtype as never)) {
    return { error: "Bitte eine gültige Erwerbsoption auswählen.", success: null };
  }

  const allowedSubtypes = ACQUISITION_SUBTYPE_OPTIONS[acquisitionType as "purchase" | "finance" | "lease"].map((entry) => entry.value);
  if (!acquisitionSubtype || !allowedSubtypes.includes(acquisitionSubtype as never)) {
    return { error: "Bitte eine passende Unteroption für die Erwerbsart auswählen.", success: null };
  }

  if ((acquisitionType === "finance" || acquisitionType === "lease") && (monthlyPayment === null || termMonths === null)) {
    return { error: "Bitte Monatsrate und Laufzeit für Finanzierung oder Leasing ausfüllen.", success: null };
  }

  const normalizedPurchasePrice =
    acquisitionType === "purchase"
      ? purchasePrice
      : (downPayment ?? 0) + (monthlyPayment ?? 0) * (termMonths ?? 0) + (finalPayment ?? 0);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null };
  }

  const updatePayload = {
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
    engine_power_ps: enginePowerPs,
    engine_displacement_cc: engineDisplacementCc,
    special_equipment: specialEquipment,
    acquisition_type: acquisitionType,
    acquisition_subtype: acquisitionSubtype,
    down_payment: downPayment,
    monthly_payment: monthlyPayment,
    term_months: termMonths,
    final_payment: finalPayment,
    contract_start_date: contractStartDate,
    purchase_price: normalizedPurchasePrice,
    purchase_date: purchaseDate,
  };

  let { error } = await supabase
    .from("vehicles")
    .update(updatePayload)
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (isMissingEnginePowerPsColumnError(error)) {
    const { engine_power_ps: ignoredEnginePowerPs, ...fallbackPayload } = updatePayload;
    void ignoredEnginePowerPs;
    const retry = await supabase
      .from("vehicles")
      .update(fallbackPayload)
      .eq("id", vehicleId)
      .eq("user_id", user.id);
    error = retry.error;
  }

  if (error) {
    return { error: "Fahrzeug konnte nicht aktualisiert werden.", success: null };
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath(`/vehicles/${vehicleId}/edit`);
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
