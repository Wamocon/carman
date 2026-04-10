"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CostCategory } from "@/types/domain";

const MAX_COMMENT_LENGTH = 3000;
const MAX_NOTE_LENGTH = 2000;
const MAX_AMOUNT = 999999.99;
const MAX_MILEAGE = 9999999;
const MAX_LITERS = 999.999;
const MAX_PRICE_PER_LITER = 99.999;

const VALID_CATEGORIES = new Set<string>([
  "fuel",
  "maintenance",
  "repair",
  "insurance",
  "tax",
  "leasing",
  "parking",
  "other",
]);

function parseOptionalFloat(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function updateCostEntry(
  _prevState: { error: string | null; success: string | null },
  formData: FormData,
) {
  const costEntryId = (formData.get("cost_entry_id") as string) ?? "";
  const category = (formData.get("category") as string) ?? "";
  const title = ((formData.get("title") as string) ?? "").trim();
  const amountStr = ((formData.get("amount") as string) ?? "").trim();
  const date = ((formData.get("date") as string) ?? "").trim();
  const mileageStr = ((formData.get("mileage") as string) ?? "").trim();
  const litersStr = ((formData.get("liters") as string) ?? "").trim();
  const pricePerLiterStr = ((formData.get("price_per_liter") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  if (!costEntryId || !category || !title || !amountStr || !date) {
    return { error: "Bitte alle Pflichtfelder ausfüllen.", success: null };
  }

  if (!VALID_CATEGORIES.has(category)) {
    return { error: "Ungültige Kategorie.", success: null };
  }

  const amount = parseOptionalFloat(amountStr);

  if (Number.isNaN(Date.parse(date))) {
    return { error: "Bitte ein gültiges Datum eingeben.", success: null };
  }

  const mileage = mileageStr ? Number.parseInt(mileageStr, 10) : null;
  if (mileage !== null && (Number.isNaN(mileage) || mileage < 0 || mileage > MAX_MILEAGE)) {
    return { error: "Bitte einen gültigen Kilometerstand eingeben.", success: null };
  }

  const parsedLiters = parseOptionalFloat(litersStr);
  if (parsedLiters !== null && (parsedLiters < 0 || parsedLiters > MAX_LITERS)) {
    return { error: "Bitte gültige Liter eingeben (max. 999.999).", success: null };
  }

  const parsedPricePerLiter = parseOptionalFloat(pricePerLiterStr);
  if (
    parsedPricePerLiter !== null &&
    (parsedPricePerLiter < 0 || parsedPricePerLiter > MAX_PRICE_PER_LITER)
  ) {
    return { error: "Bitte einen gültigen Preis je Liter eingeben.", success: null };
  }

  const liters = category === "fuel" ? parsedLiters : null;
  const pricePerLiter = category === "fuel" ? parsedPricePerLiter : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null };
  }

  const { data: existingEntry, error: existingError } = await supabase
    .from("cost_entries")
    .select("id, vehicle_id, reminder_id, is_vehicle_sale")
    .eq("id", costEntryId)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existingEntry) {
    return { error: "Kostenposition nicht gefunden.", success: null };
  }

  const minimumAmount = existingEntry.is_vehicle_sale ? -MAX_AMOUNT : 0;
  if (amount === null || amount < minimumAmount || amount > MAX_AMOUNT) {
    return { error: "Bitte einen gültigen Betrag eingeben.", success: null };
  }

  const { error: updateError } = await supabase
    .from("cost_entries")
    .update({
      category: existingEntry.is_vehicle_sale ? "other" : (category as CostCategory),
      title,
      amount,
      date,
      mileage,
      liters,
      price_per_liter: pricePerLiter,
      notes,
    })
    .eq("id", costEntryId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: "Kostenposition konnte nicht gespeichert werden.", success: null };
  }

  revalidatePath(`/costs/${costEntryId}`);
  revalidatePath("/costs");
  revalidatePath(`/vehicles/${existingEntry.vehicle_id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cost-trend");

  return { error: null, success: "Kostenposition aktualisiert." };
}

export async function addCostComment(
  _prevState: { error: string | null; success: string | null },
  formData: FormData,
) {
  const costEntryId = (formData.get("cost_entry_id") as string) ?? "";
  const body = ((formData.get("body") as string) ?? "").trim();

  if (!costEntryId || !body) {
    return { error: "Bitte einen Kommentar eingeben.", success: null };
  }

  if (body.length > MAX_COMMENT_LENGTH) {
    return { error: "Der Kommentar ist zu lang.", success: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet.", success: null };
  }

  const { data: cost, error: costError } = await supabase
    .from("cost_entries")
    .select("id")
    .eq("id", costEntryId)
    .eq("user_id", user.id)
    .single();

  if (costError || !cost) {
    return { error: "Kostenposition nicht gefunden.", success: null };
  }

  const { error } = await supabase.from("cost_comments").insert({
    cost_entry_id: costEntryId,
    user_id: user.id,
    body,
  });

  if (error) {
    return { error: "Kommentar konnte nicht gespeichert werden.", success: null };
  }

  revalidatePath(`/costs/${costEntryId}`);

  return { error: null, success: "Kommentar gespeichert." };
}

export async function createCostInvoiceRecord(formData: FormData) {
  const costEntryId = (formData.get("cost_entry_id") as string) ?? "";
  const storagePath = (formData.get("storage_path") as string) ?? "";
  const fileName = (formData.get("file_name") as string) ?? "";
  const mimeType = (formData.get("mime_type") as string) ?? "";
  const fileSizeRaw = (formData.get("file_size_bytes") as string) ?? "";
  const invoiceNumber = ((formData.get("invoice_number") as string) ?? "").trim() || null;
  const invoiceDate = ((formData.get("invoice_date") as string) ?? "").trim() || null;
  const note = ((formData.get("note") as string) ?? "").trim() || null;

  if (!costEntryId || !storagePath || !fileName || !mimeType || !fileSizeRaw) {
    return { error: "Unvollständige Rechnungsdaten." };
  }

  const fileSizeBytes = Number.parseInt(fileSizeRaw, 10);
  if (Number.isNaN(fileSizeBytes) || fileSizeBytes <= 0) {
    return { error: "Ungueltige Dateigroesse." };
  }

  if (note && note.length > MAX_NOTE_LENGTH) {
    return { error: "Die Notiz ist zu lang." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const expectedPrefix = `${user.id}/${costEntryId}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return { error: "Ungueltiger Speicherpfad." };
  }

  const { data: cost, error: costError } = await supabase
    .from("cost_entries")
    .select("id")
    .eq("id", costEntryId)
    .eq("user_id", user.id)
    .single();

  if (costError || !cost) {
    return { error: "Kostenposition nicht gefunden." };
  }

  const { error } = await supabase.from("cost_invoices").insert({
    cost_entry_id: costEntryId,
    user_id: user.id,
    storage_path: storagePath,
    file_name: fileName,
    mime_type: mimeType,
    file_size_bytes: fileSizeBytes,
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    note,
  });

  if (error) {
    return { error: "Rechnung konnte nicht dokumentiert werden." };
  }

  revalidatePath(`/costs/${costEntryId}`);
  return { error: null };
}
