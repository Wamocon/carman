import Link from "next/link";
import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import { calculateAcquisitionCost } from "@/lib/vehicle-market";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PhotoIcon } from "@/components/Icons";
import { ACQUISITION_LABELS } from "@/lib/vehicle-market";
import type { CostEntry, Vehicle, VehicleImage } from "@/types/domain";
import { CostsFilter } from "./CostsFilter";
import { CostsExportButton } from "./CostsExportButton";

export const metadata = {
  title: "Kosten — CarMan",
};

const CATEGORY_LABELS: Record<string, string> = {
  fuel: "Tanken",
  maintenance: "Wartung",
  repair: "Reparatur",
  insurance: "Versicherung",
  tax: "Steuer",
  leasing: "Leasing",
  financing: "Finanzierung",
  parking: "Parken",
  other: "Sonstiges",
  acquisition: "Anschaffung",
};

const COST_CATEGORY_ORDER = [
  "acquisition",
  "fuel",
  "maintenance",
  "repair",
  "insurance",
  "tax",
  "leasing",
  "financing",
  "parking",
  "other",
] as const;

const FUEL_LABELS: Record<string, string> = {
  petrol: "Benzin",
  diesel: "Diesel",
  electric: "Elektro",
  hybrid: "Hybrid",
  lpg: "LPG",
  cng: "CNG",
};

const PAGE_SIZE = 25;

export default async function CostsPage(props: {
  searchParams: Promise<{
    vehicle_id?: string;
    categories?: string;
    status?: string;
    page?: string;
    start_date?: string;
    end_date?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Parse multi-select categories from comma-separated URL param
  const selectedCategories = (searchParams.categories ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const selectedStatus = searchParams.status ?? "";

  const hasActiveFilters =
    Boolean(searchParams.vehicle_id) ||
    selectedCategories.length > 0 ||
    Boolean(selectedStatus) ||
    Boolean(searchParams.start_date) ||
    Boolean(searchParams.end_date);

  const preservedParams = new URLSearchParams();
  if (searchParams.vehicle_id) preservedParams.set("vehicle_id", searchParams.vehicle_id);
  if (searchParams.categories) preservedParams.set("categories", searchParams.categories);
  if (selectedStatus) preservedParams.set("status", selectedStatus);
  if (searchParams.start_date) preservedParams.set("start_date", searchParams.start_date);
  if (searchParams.end_date) preservedParams.set("end_date", searchParams.end_date);

  // Fetch vehicles for filter dropdown and cards
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(
      "id, make, model, status, purchase_price, acquisition_type, down_payment, monthly_payment, term_months, final_payment, year, variant, fuel_type, license_plate, current_mileage",
    )
    .eq("user_id", user.id)
    .eq("status", DEFAULT_VEHICLE_STATUS)
    .order("make");

  const allVehicles = (vehicles ?? []) as Pick<
    Vehicle,
    | "id"
    | "make"
    | "model"
    | "status"
    | "purchase_price"
    | "acquisition_type"
    | "down_payment"
    | "monthly_payment"
    | "term_months"
    | "final_payment"
    | "year"
    | "variant"
    | "fuel_type"
    | "license_plate"
    | "current_mileage"
  >[];

  const { data: allCostsRaw } = await supabase
    .from("cost_entries")
    .select("vehicle_id, category, amount, payment_status, vehicles!vehicle_id!inner(status)")
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS);

  const allCostsForTotals = (allCostsRaw ?? []) as Array<{
    vehicle_id: string;
    category: string;
    amount: number;
    payment_status: string;
  }>;

  // Category breakdown per vehicle (vehicle cards) — only paid costs
  const categoryBreakdownByVehicle = allCostsForTotals.reduce<
    Record<string, Record<string, number>>
  >((acc, entry) => {
    if (entry.payment_status !== "paid") return acc;
    const vMap = acc[entry.vehicle_id] ?? {};
    vMap[entry.category] = (vMap[entry.category] ?? 0) + entry.amount;
    acc[entry.vehicle_id] = vMap;
    return acc;
  }, {});

  const runningCostByVehicle = allCostsForTotals
    .filter((entry) => entry.payment_status === "paid")
    .reduce<Record<string, number>>((acc, entry) => {
      acc[entry.vehicle_id] = (acc[entry.vehicle_id] ?? 0) + entry.amount;
      return acc;
    }, {});

  const allRunningCosts = allCostsForTotals
    .filter((entry) => entry.payment_status === "paid")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const allPurchaseCosts = allVehicles.reduce(
    (sum, vehicle) => sum + calculateAcquisitionCost(vehicle),
    0,
  );
  const allOwnershipCosts = allRunningCosts + allPurchaseCosts;

  // Filtered totals query
  let filteredTotalsQuery = supabase
    .from("cost_entries")
    .select("amount, payment_status, vehicles!vehicle_id!inner(status)")
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS);

  if (searchParams.vehicle_id)
    filteredTotalsQuery = filteredTotalsQuery.eq("vehicle_id", searchParams.vehicle_id);
  if (selectedCategories.length > 0)
    filteredTotalsQuery = filteredTotalsQuery.in("category", selectedCategories);
  if (selectedStatus)
    filteredTotalsQuery = filteredTotalsQuery.eq("payment_status", selectedStatus);
  if (searchParams.start_date)
    filteredTotalsQuery = filteredTotalsQuery.gte("date", searchParams.start_date);
  if (searchParams.end_date)
    filteredTotalsQuery = filteredTotalsQuery.lte("date", searchParams.end_date);

  const { data: filteredTotalsRaw } = await filteredTotalsQuery;
  const filteredRunningCosts = (filteredTotalsRaw ?? [])
    .filter((entry) => (entry as { payment_status?: string }).payment_status === "paid")
    .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);

  // Build paginated cost list query
  let query = supabase
    .from("cost_entries")
    .select("*, vehicles!vehicle_id!inner(make, model, status)", { count: "exact" })
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS)
    .order("date", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (searchParams.vehicle_id) query = query.eq("vehicle_id", searchParams.vehicle_id);
  if (selectedCategories.length > 0) query = query.in("category", selectedCategories);
  if (selectedStatus) query = query.eq("payment_status", selectedStatus);
  if (searchParams.start_date) query = query.gte("date", searchParams.start_date);
  if (searchParams.end_date) query = query.lte("date", searchParams.end_date);

  const { data: costEntries, count } = await query;

  const costs = (costEntries ?? []) as (CostEntry & {
    vehicles: { make: string; model: string; status: string };
  })[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Primary images for vehicle cards
  const { data: primaryImages } = await supabase
    .from("vehicle_images")
    .select("vehicle_id, storage_path, focal_point_x, focal_point_y")
    .eq("user_id", user.id)
    .eq("is_primary", true);

  const imageRecords = (primaryImages ?? []) as Pick<VehicleImage, "vehicle_id" | "storage_path" | "focal_point_x" | "focal_point_y">[];
  const signedImages = await Promise.all(
    imageRecords.map(async (img) => {
      const { data } = await supabase.storage
        .from("vehicle-images")
        .createSignedUrl(img.storage_path, 60 * 30);
      return [img.vehicle_id, { url: data?.signedUrl ?? null, focalX: img.focal_point_x, focalY: img.focal_point_y }] as const;
    }),
  );
  const primaryImageMap = Object.fromEntries(signedImages);

  return (
    <div className="space-y-6 stagger-children">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Kosten</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">
              Kosteneinträge verwalten
            </h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">
              Filtere nach Fahrzeug oder Kategorie, um Trends zu erkennen. Für schnelle Eingaben
              nutze den Button rechts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CostsExportButton
              vehicles={allVehicles}
              vehicleId={searchParams.vehicle_id}
              startDate={searchParams.start_date}
              endDate={searchParams.end_date}
            />
            <Link
              href="/costs/new"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong active:scale-[0.97]"
            >
              Neuer Eintrag
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell space-y-2 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          {hasActiveFilters ? "Gefilterte Kosten (bezahlt)" : "Gesamtkosten (bezahlt)"}
        </p>
        <p className="text-2xl font-semibold text-foreground">
          {formatCurrency(filteredRunningCosts)}
        </p>
      </section>

      {allVehicles.length > 0 ? (
        <section className="section-shell space-y-4 p-4 sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Fahrzeugübersicht</p>
            <h2 className="mt-1 text-base font-semibold text-foreground">Kosten nach Fahrzeug</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-card/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted">Betriebskosten gesamt</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(allRunningCosts)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted">Anschaffung gesamt</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(allPurchaseCosts)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted">Gesamtaufwand</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(allOwnershipCosts)}
              </p>
            </div>
          </div>

          {/* Vehicle cards — image + name link to vehicle costs tab; details element is standalone */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allVehicles.map((vehicle) => {
              const runningCosts = runningCostByVehicle[vehicle.id] ?? 0;
              const purchasePrice = calculateAcquisitionCost(vehicle);
              const totalOwnership = runningCosts + purchasePrice;
              const categoryBreakdown = categoryBreakdownByVehicle[vehicle.id] ?? {};
              const imageEntry = primaryImageMap[vehicle.id] ?? undefined;
              const imageUrl = imageEntry?.url;
              const vehicleHref = `/vehicles/${vehicle.id}?tab=costs`;

              return (
                <article key={vehicle.id} className="surface overflow-hidden rounded-2xl">
                  <Link href={vehicleHref} className="block">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-36 w-full object-cover"
                        style={{ objectPosition: `${(imageEntry?.focalX ?? 0.5) * 100}% ${(imageEntry?.focalY ?? 0.5) * 100}%` }}
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-foreground/5 text-muted">
                        <PhotoIcon className="h-8 w-8" />
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link href={vehicleHref} className="block">
                      <p className="font-semibold text-foreground">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {[
                          vehicle.year,
                          vehicle.variant ||
                            FUEL_LABELS[vehicle.fuel_type] ||
                            vehicle.fuel_type,
                          vehicle.license_plate,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {vehicle.current_mileage ? (
                        <p className="mt-0.5 text-xs text-muted">
                          {vehicle.current_mileage.toLocaleString("de-DE")} km
                        </p>
                      ) : null}
                    </Link>

                    <div className="mt-3 space-y-2 text-xs sm:text-sm">
                      <Link
                        href={vehicleHref}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-muted">Betriebskosten</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(runningCosts)}
                        </span>
                      </Link>

                      {/* Standalone details element — no z-index stacking needed */}
                      <details className="rounded-lg border border-border/60 bg-card/70 px-2.5 py-2">
                        <summary className="cursor-pointer text-xs font-medium text-foreground select-none">
                          Kategorien anzeigen
                        </summary>
                        <div className="mt-2 space-y-1.5">
                          {COST_CATEGORY_ORDER.map((cat) =>
                            categoryBreakdown[cat] ? (
                              <div
                                key={cat}
                                className="flex items-center justify-between gap-2 text-xs"
                              >
                                <span className="text-muted">{CATEGORY_LABELS[cat]}</span>
                                <span className="font-medium text-foreground">
                                  {formatCurrency(categoryBreakdown[cat])}
                                </span>
                              </div>
                            ) : null,
                          )}
                        </div>
                      </details>

                      <Link href={vehicleHref} className="block space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted">
                            Anschaffung ({ACQUISITION_LABELS[vehicle.acquisition_type] ?? "Kauf"})
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(purchasePrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                          <span className="font-medium text-foreground">Gesamtaufwand</span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(totalOwnership)}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <CostsFilter
        vehicles={allVehicles}
        selectedVehicle={searchParams.vehicle_id}
        selectedCategories={selectedCategories}
        selectedStatus={selectedStatus}
        selectedStartDate={searchParams.start_date}
        selectedEndDate={searchParams.end_date}
      />

      {costs.length === 0 ? (
        <section className="section-shell space-y-2 p-4 sm:p-5">
          <p className="text-sm text-muted">Keine Kosteneinträge vorhanden.</p>
        </section>
      ) : (
        <>
          <div className="section-shell overflow-x-auto p-4 sm:p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted">Datum</th>
                  <th className="pb-2 pr-4 font-medium text-muted">Kategorie</th>
                  <th className="pb-2 pr-4 font-medium text-muted">Titel</th>
                  <th className="pb-2 pr-4 font-medium text-muted">Fahrzeug</th>
                  <th className="pb-2 pr-4 font-medium text-muted">Status</th>
                  <th className="pb-2 text-right font-medium text-muted">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 transition-colors hover:bg-foreground/[0.03]"
                  >
                    <td className="py-2 pr-4">{formatDate(c.date)}</td>
                    <td className="py-2 pr-4">
                      {c.is_vehicle_sale
                        ? "Fahrzeugverkauf"
                        : (CATEGORY_LABELS[c.category] ?? c.category)}
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        href={`/costs/${c.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      {c.vehicles.make} {c.vehicles.model}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          c.payment_status === "paid"
                            ? "bg-success/15 text-success"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {c.payment_status === "paid" ? "Bezahlt" : "Offen"}
                      </span>
                    </td>
                    <td className="py-2 text-right">{formatCurrency(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/costs?page=${page - 1}${preservedParams.toString() ? `&${preservedParams.toString()}` : ""}`}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm hover:bg-foreground/5"
                >
                  Zurück
                </Link>
              )}
              <span className="text-sm text-muted">
                Seite {page} von {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/costs?page=${page + 1}${preservedParams.toString() ? `&${preservedParams.toString()}` : ""}`}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm hover:bg-foreground/5"
                >
                  Weiter
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
