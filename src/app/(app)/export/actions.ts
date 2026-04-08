"use server";

import { createClient } from "@/lib/supabase/server";
import { isProFeature } from "@/lib/utils";
import type { UserProfile } from "@/types/domain";

export async function exportCosts(formData: FormData): Promise<
  { csv: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  // Verify Pro subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile = profile as UserProfile | null;
  if (isProFeature(userProfile?.subscription_tier ?? "free")) {
    return { error: "Diese Funktion ist nur im Pro-Tarif verfügbar." };
  }

  const vehicleId = (formData.get("vehicle_id") as string) || null;
  const fromDate = (formData.get("from_date") as string) || null;
  const toDate = (formData.get("to_date") as string) || null;

  let query = supabase
    .from("cost_entries")
    .select("*, vehicles!inner(make, model, license_plate)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (vehicleId) {
    query = query.eq("vehicle_id", vehicleId);
  }
  if (fromDate) {
    query = query.gte("date", fromDate);
  }
  if (toDate) {
    query = query.lte("date", toDate);
  }

  const { data: costs, error } = await query;

  if (error) {
    return { error: "Fehler beim Laden der Daten." };
  }

  if (!costs || costs.length === 0) {
    return { error: "Keine Daten für den gewählten Zeitraum gefunden." };
  }

  // Build CSV
  const header = "Datum;Fahrzeug;Kennzeichen;Kategorie;Titel;Betrag;Kilometerstand;Liter;Preis/Liter;Notizen";
  const rows = costs.map((c: Record<string, unknown>) => {
    const v = c.vehicles as { make: string; model: string; license_plate: string };
    return [
      c.date,
      `${v.make} ${v.model}`,
      v.license_plate,
      c.category,
      `"${String(c.title ?? "").replace(/"/g, '""')}"`,
      String(c.amount ?? "").replace(".", ","),
      c.mileage ?? "",
      c.liters ? String(c.liters).replace(".", ",") : "",
      c.price_per_liter ? String(c.price_per_liter).replace(".", ",") : "",
      c.notes ? `"${String(c.notes).replace(/"/g, '""')}"` : "",
    ].join(";");
  });

  const csv = [header, ...rows].join("\n");

  return { csv };
}
