import Link from "next/link";
import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import { calculateAcquisitionCost } from "@/lib/vehicle-market";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CostEntry, Vehicle } from "@/types/domain";
import { CostsFilter } from "./CostsFilter";
import { ExportForm } from "../export/ExportForm";

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
  parking: "Parken",
  other: "Sonstiges",
};

const PAGE_SIZE = 25;

export default async function CostsPage(props: {
  searchParams: Promise<{
    vehicle_id?: string;
    category?: string;
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
  const hasActiveFilters =
    Boolean(searchParams.vehicle_id) ||
    Boolean(searchParams.category) ||
    Boolean(searchParams.start_date) ||
    Boolean(searchParams.end_date);

  const preservedParams = new URLSearchParams();
  if (searchParams.vehicle_id) {
    preservedParams.set("vehicle_id", searchParams.vehicle_id);
  }
  if (searchParams.category) {
    preservedParams.set("category", searchParams.category);
  }
  if (searchParams.start_date) {
    preservedParams.set("start_date", searchParams.start_date);
  }
  if (searchParams.end_date) {
    preservedParams.set("end_date", searchParams.end_date);
  }

  // Fetch vehicles for filter dropdown
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, purchase_price, acquisition_type, down_payment, monthly_payment, term_months, final_payment")
    .eq("user_id", user.id)
    .eq("status", DEFAULT_VEHICLE_STATUS)
    .order("make");

  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model" | "status" | "purchase_price" | "acquisition_type" | "down_payment" | "monthly_payment" | "term_months" | "final_payment">[];

  const { data: allCostsRaw } = await supabase
    .from("cost_entries")
    .select("vehicle_id, amount, vehicles!vehicle_id!inner(status)")
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS);

  const allCostsForTotals = (allCostsRaw ?? []) as Array<{ vehicle_id: string; amount: number }>;
  const runningCostByVehicle = allCostsForTotals.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.vehicle_id] = (acc[entry.vehicle_id] ?? 0) + entry.amount;
    return acc;
  }, {});
  const allRunningCosts = allCostsForTotals.reduce((sum, entry) => sum + entry.amount, 0);
  const allPurchaseCosts = allVehicles.reduce((sum, vehicle) => sum + calculateAcquisitionCost(vehicle), 0);
  const allOwnershipCosts = allRunningCosts + allPurchaseCosts;

  let filteredTotalsQuery = supabase
    .from("cost_entries")
    .select("amount, vehicles!vehicle_id!inner(status)")
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS);

  if (searchParams.vehicle_id) {
    filteredTotalsQuery = filteredTotalsQuery.eq("vehicle_id", searchParams.vehicle_id);
  }
  if (searchParams.category) {
    filteredTotalsQuery = filteredTotalsQuery.eq("category", searchParams.category);
  }
  if (searchParams.start_date) {
    filteredTotalsQuery = filteredTotalsQuery.gte("date", searchParams.start_date);
  }
  if (searchParams.end_date) {
    filteredTotalsQuery = filteredTotalsQuery.lte("date", searchParams.end_date);
  }

  const { data: filteredTotalsRaw } = await filteredTotalsQuery;
  const filteredRunningCosts = (filteredTotalsRaw ?? []).reduce(
    (sum, entry) => sum + Number(entry.amount ?? 0),
    0,
  );

  // Build cost query
  let query = supabase
    .from("cost_entries")
    .select("*, vehicles!vehicle_id!inner(make, model, status)", { count: "exact" })
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS)
    .order("date", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (searchParams.vehicle_id) {
    query = query.eq("vehicle_id", searchParams.vehicle_id);
  }
  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }
  if (searchParams.start_date) {
    query = query.gte("date", searchParams.start_date);
  }
  if (searchParams.end_date) {
    query = query.lte("date", searchParams.end_date);
  }

  const { data: costEntries, count } = await query;

  const costs = (costEntries ?? []) as (CostEntry & {
    vehicles: { make: string; model: string; status: string };
  })[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Kosten</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Kosteneinträge verwalten</h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">Filtere nach Fahrzeug oder Kategorie, um Trends zu erkennen. Für schnelle Eingaben nutze den Button rechts.</p>
          </div>
          <Link
            href="/costs/new"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Neuer Eintrag
          </Link>
        </div>
      </section>

      <section className="section-shell space-y-2 p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          {hasActiveFilters ? "Gefilterte Kosten" : "Gesamtkosten"}
        </p>
        <p className="text-2xl font-semibold text-foreground">{formatCurrency(filteredRunningCosts)}</p>
      </section>

      {allVehicles.length > 0 ? (
        <details className="section-shell p-4 sm:p-5">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Gesamtkosten auf- und zuklappen
          </summary>
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Betriebskosten gesamt</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(allRunningCosts)}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Anschaffung gesamt</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(allPurchaseCosts)}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Gesamtaufwand</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(allOwnershipCosts)}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {allVehicles.map((vehicle) => {
                const runningCosts = runningCostByVehicle[vehicle.id] ?? 0;
                const purchasePrice = calculateAcquisitionCost(vehicle);
                const totalOwnership = runningCosts + purchasePrice;

                return (
                  <Link
                    key={vehicle.id}
                    href={`/vehicles/${vehicle.id}`}
                    className="rounded-xl border border-border/70 bg-card/70 p-3 transition-colors hover:bg-foreground/5"
                  >
                    <p className="font-medium text-foreground">{vehicle.make} {vehicle.model}</p>
                    <div className="mt-2 space-y-1 text-xs sm:text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted">Betriebskosten</span>
                        <span className="font-medium text-foreground">{formatCurrency(runningCosts)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted">Anschaffung</span>
                        <span className="font-medium text-foreground">{formatCurrency(purchasePrice)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-1.5">
                        <span className="font-medium text-foreground">Gesamtaufwand</span>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(totalOwnership)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </details>
      ) : null}

      <CostsFilter
        vehicles={allVehicles}
        selectedVehicle={searchParams.vehicle_id}
        selectedCategory={searchParams.category}
        selectedStartDate={searchParams.start_date}
        selectedEndDate={searchParams.end_date}
      />

      <section className="section-shell p-5 sm:p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">CSV Export</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Kosten als CSV exportieren</h2>
          <p className="mt-2 text-sm help-copy">
            Exportiere direkt aus der Kostenverwaltung. Fahrzeug und Zeitraum kannst du im Exportformular festlegen.
          </p>
        </div>
        <ExportForm vehicles={allVehicles} />
      </section>

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
                  <th className="pb-2 text-right font-medium text-muted">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="py-2 pr-4">{formatDate(c.date)}</td>
                    <td className="py-2 pr-4">
                      {c.is_vehicle_sale ? "Fahrzeugverkauf" : CATEGORY_LABELS[c.category] ?? c.category}
                    </td>
                    <td className="py-2 pr-4">
                      <Link href={`/costs/${c.id}`} className="font-medium text-brand hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      {c.vehicles.make} {c.vehicles.model}
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


