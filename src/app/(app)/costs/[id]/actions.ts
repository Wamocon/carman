"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_COMMENT_LENGTH = 3000;
const MAX_NOTE_LENGTH = 2000;

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
