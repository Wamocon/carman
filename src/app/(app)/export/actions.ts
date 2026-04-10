"use server";

import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import { createClient } from "@/lib/supabase/server";
import { isProFeature } from "@/lib/utils";
import type { UserProfile } from "@/types/domain";

const VALID_CATEGORIES = new Set([
  "fuel",
  "maintenance",
  "repair",
  "insurance",
  "tax",
  "leasing",
  "parking",
  "other",
]);

const CATEGORY_LABELS: Record<string, string> = {
  fuel: "Tanken",
  maintenance: "Wartung",
  repair: "Reparatur",
  insurance: "Versicherung",
  tax: "Steuer",
  leasing: "Leasing",
  parking: "Parken",
  other: "Sonstiges",
};

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
  const fixedVehicleId = (formData.get("fixed_vehicle_id") as string) || null;
  const fromDate = (formData.get("from_date") as string) || null;
  const toDate = (formData.get("to_date") as string) || null;
  const categories = formData
    .getAll("categories")
    .filter((entry): entry is string => typeof entry === "string")
    .filter((entry) => VALID_CATEGORIES.has(entry));

  const selectedVehicleId = fixedVehicleId || vehicleId;

  if (selectedVehicleId) {
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, status")
      .eq("id", selectedVehicleId)
      .eq("user_id", user.id)
      .single();

    if (vehicleError || !vehicle) {
      return { error: "Das gewünschte Fahrzeug wurde nicht gefunden." };
    }

    if (!fixedVehicleId && vehicle.status !== DEFAULT_VEHICLE_STATUS) {
      return { error: "Verkaufte Fahrzeuge exportierst du direkt in der Fahrzeugansicht." };
    }
  }

  let query = supabase
    .from("cost_entries")
    .select("*, vehicles!vehicle_id!inner(make, model, license_plate, status)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (selectedVehicleId) {
    query = query.eq("vehicle_id", selectedVehicleId);
  } else {
    query = query.eq("vehicles.status", DEFAULT_VEHICLE_STATUS);
  }
  if (fromDate) {
    query = query.gte("date", fromDate);
  }
  if (toDate) {
    query = query.lte("date", toDate);
  }
  if (categories.length > 0) {
    query = query.in("category", categories);
  }

  const { data: costs, error } = await query;

  if (error) {
    return { error: "Fehler beim Laden der Daten." };
  }

  if (!costs || costs.length === 0) {
    return { error: "Keine Daten für den gewählten Zeitraum gefunden." };
  }

  // Build CSV
  const header = "Datum;Fahrzeug;Kennzeichen;Typ;Kategorie;Titel;Betrag;Kilometerstand;Liter;Preis/Liter;Notizen";
  const rows = costs.map((c: Record<string, unknown>) => {
    const v = c.vehicles as { make: string; model: string; license_plate: string };
    const isVehicleSale = Boolean(c.is_vehicle_sale);
    return [
      c.date,
      `${v.make} ${v.model}`,
      v.license_plate,
      isVehicleSale ? "Verkauf" : "Kosten",
      isVehicleSale ? "Fahrzeugverkauf" : CATEGORY_LABELS[String(c.category)] ?? c.category,
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


