import Link from "next/link";
import { PhotoIcon } from "@/components/Icons";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { canAddVehicle, formatCurrency } from "@/lib/utils";
import {
  parseVehicleStatusFilter,
  VEHICLE_STATUS,
  VEHICLE_STATUS_LABELS,
} from "@/lib/vehicle-status";
import { ACQUISITION_LABELS, calculateAcquisitionCost } from "@/lib/vehicle-market";
import { localizeCatalogText } from "@/lib/vehicle-catalog";
import type { UserProfile, Vehicle, VehicleImage } from "@/types/domain";

export const metadata = {
  title: "Fahrzeuge — CarMan",
};

const COST_CATEGORY_LABELS: Record<string, string> = {
  fuel: "Tanken",
  maintenance: "Wartung",
  repair: "Reparatur",
  insurance: "Versicherung",
  tax: "Steuer",
  leasing: "Leasing",
  parking: "Parken",
  other: "Sonstiges",
};

const COST_CATEGORY_ORDER = [
  "fuel",
  "maintenance",
  "repair",
  "insurance",
  "tax",
  "leasing",
  "parking",
  "other",
] as const;

export default async function VehiclesPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locale = await getLocaleFromCookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: vehicles }, { data: profile }, { data: costs }, { data: primaryImages }] =
    await Promise.all([
      supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("cost_entries").select("vehicle_id, category, amount, is_vehicle_sale").eq("user_id", user.id),
      supabase
        .from("vehicle_images")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true),
    ]);

  const allVehicles = (vehicles ?? []) as Vehicle[];
  const userProfile = profile as UserProfile | null;
  const allCosts = (costs ?? []) as Array<{ vehicle_id: string; category: string; amount: number; is_vehicle_sale: boolean }>;
  const imageRecords = (primaryImages ?? []) as VehicleImage[];
  const tier = userProfile?.subscription_tier ?? "free";
  const canAdd = canAddVehicle(tier, allVehicles.length);
  const statusFilter = parseVehicleStatusFilter(searchParams.status);
  const visibleVehicles = allVehicles.filter((vehicle) => {
    if (statusFilter === "all") {
      return true;
    }

    return vehicle.status === statusFilter;
  });

  const fuelLabel: Record<string, string> = {
    petrol: locale === "de" ? "Benzin" : "Petrol",
    diesel: locale === "de" ? "Diesel" : "Diesel",
    electric: locale === "de" ? "Elektro" : "Electric",
    hybrid: locale === "de" ? "Hybrid" : "Hybrid",
    lpg: "LPG",
    cng: "CNG",
  };

  const vehicleRunningCostMap = allCosts.reduce<Record<string, number>>((acc, entry) => {
    if (entry.is_vehicle_sale) return acc;
    acc[entry.vehicle_id] = (acc[entry.vehicle_id] ?? 0) + entry.amount;
    return acc;
  }, {});

  const vehicleSaleMap = allCosts.reduce<Record<string, number>>((acc, entry) => {
    if (!entry.is_vehicle_sale) return acc;
    acc[entry.vehicle_id] = (acc[entry.vehicle_id] ?? 0) + entry.amount;
    return acc;
  }, {});

  const categoryBreakdownByVehicle = allCosts.reduce<Record<string, Record<string, number>>>(
    (acc, entry) => {
      if (entry.is_vehicle_sale) return acc;
      const vehicleCategories = acc[entry.vehicle_id] ?? {};
      vehicleCategories[entry.category] = (vehicleCategories[entry.category] ?? 0) + entry.amount;
      acc[entry.vehicle_id] = vehicleCategories;
      return acc;
    },
    {},
  );

  const signedPrimaryImages = await Promise.all(
    imageRecords.map(async (image) => {
      const { data } = await supabase.storage
        .from("vehicle-images")
        .createSignedUrl(image.storage_path, 60 * 30);
      return [image.vehicle_id, data?.signedUrl ?? null] as const;
    }),
  );

  const primaryImageMap = Object.fromEntries(signedPrimaryImages);

  return (
    <div className="space-y-6 stagger-children">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Fahrzeuge</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">
              Dein Fahrzeugbestand
            </h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">
              Lege für jedes Fahrzeug ein eigenes Profil an. Danach kannst du Kosten und
              Servicetermine direkt zuordnen.
            </p>
          </div>
          {canAdd ? (
            <Link
              href="/vehicles/new"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
            >
              Neues Fahrzeug
            </Link>
          ) : (
            <div className="rounded-xl border border-amber-300/50 bg-amber-100/65 px-3 py-2 text-sm text-amber-800">
              Fahrzeuglimit erreicht, Pro für mehr Fahrzeuge
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Fahrzeugkarten</h2>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          <Link
            href="/vehicles?status=owned"
            className={`rounded-full border px-3 py-1.5 ${
              statusFilter === "owned"
                ? "border-brand/35 bg-brand/10 text-brand"
                : "border-border bg-card text-muted"
            }`}
          >
            In Besitz
          </Link>
          <Link
            href="/vehicles?status=sold"
            className={`rounded-full border px-3 py-1.5 ${
              statusFilter === "sold"
                ? "border-brand/35 bg-brand/10 text-brand"
                : "border-border bg-card text-muted"
            }`}
          >
            Verkauft
          </Link>
          <Link
            href="/vehicles?status=all"
            className={`rounded-full border px-3 py-1.5 ${
              statusFilter === "all"
                ? "border-brand/35 bg-brand/10 text-brand"
                : "border-border bg-card text-muted"
            }`}
          >
            Alle
          </Link>
        </div>
      </div>

      {visibleVehicles.length === 0 ? (
        <div className="section-shell border-dashed p-8 text-center">
          <p className="text-muted">
            {allVehicles.length === 0
              ? "Noch keine Fahrzeuge vorhanden."
              : "Für diesen Status sind aktuell keine Fahrzeuge vorhanden."}
          </p>
          <Link
            href="/vehicles/new"
            className="mt-3 inline-block rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Erstes Fahrzeug hinzufügen
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleVehicles.map((v) => {
            const primaryImageUrl = primaryImageMap[v.id] ?? undefined;
            const categoryBreakdown = categoryBreakdownByVehicle[v.id] ?? {};
            const acquisitionCosts = calculateAcquisitionCost(v);

            return (
              <article key={v.id} className="surface relative overflow-hidden rounded-2xl">
                <Link
                  href={`/vehicles/${v.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`${v.make} ${v.model} – Details öffnen`}
                />
                {primaryImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImageUrl}
                    alt={`${v.make} ${v.model}`}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-foreground/5 text-muted">
                    <PhotoIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      {v.make} {v.model}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        v.status === VEHICLE_STATUS.sold
                          ? "bg-foreground/10 text-foreground/75"
                          : "bg-brand/10 text-brand"
                      }`}
                    >
                      {VEHICLE_STATUS_LABELS[v.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {v.year}{" "}
                    {localizeCatalogText(v.variant, locale) ||
                      localizeCatalogText(v.body_style, locale) ||
                      fuelLabel[v.fuel_type] ||
                      v.fuel_type}
                  </p>
                  {v.engine_description ? (
                    <p className="mt-1 line-clamp-1 text-xs text-muted">
                      {localizeCatalogText(v.engine_description, locale)}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between text-sm text-muted">
                    <span>{v.license_plate}</span>
                    <span>
                      {v.current_mileage.toLocaleString(locale === "de" ? "de-DE" : "en-US")} km
                    </span>
                  </div>
                  {v.status === VEHICLE_STATUS.sold ? (
                    <p className="mt-2 text-xs text-muted">
                      Dieses Fahrzeug wird nicht mehr in globalen Übersichten mitgeführt.
                    </p>
                  ) : null}
                  <div className="mt-4 grid gap-2 rounded-xl border border-border/60 bg-card/70 p-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted">Betriebskosten</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(vehicleRunningCostMap[v.id] ?? 0)}
                      </span>
                    </div>
                    <details className="relative z-20 rounded-lg border border-border/60 bg-card/70 px-2.5 py-2">
                      <summary className="cursor-pointer text-xs font-medium text-foreground sm:text-sm">
                        Kategorien anzeigen
                      </summary>
                      <div className="mt-2 space-y-1.5">
                        {COST_CATEGORY_ORDER.map((category) => (
                          <div
                            key={category}
                            className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                          >
                            <span className="text-muted">{COST_CATEGORY_LABELS[category]}</span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(categoryBreakdown[category] ?? 0)}
                            </span>
                          </div>
                        ))}
                        {vehicleSaleMap[v.id] != null ? (
                          <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-1.5 text-xs sm:text-sm">
                            <span className="text-muted">Fahrzeugverkauf</span>
                            <span className="font-medium text-emerald-600">
                              {formatCurrency(Math.abs(vehicleSaleMap[v.id]))}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </details>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted">
                        Anschaffung ({ACQUISITION_LABELS[v.acquisition_type] ?? "Kauf"})
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(acquisitionCosts)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                      <span className="font-medium text-foreground">Gesamtaufwand</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency((vehicleRunningCostMap[v.id] ?? 0) + acquisitionCosts + (vehicleSaleMap[v.id] ?? 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
