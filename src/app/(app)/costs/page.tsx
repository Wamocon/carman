import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CostEntry, Vehicle } from "@/types/domain";
import { CostsFilter } from "./CostsFilter";

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

  // Fetch vehicles for filter dropdown
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model")
    .eq("user_id", user.id)
    .order("make");

  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model">[];

  // Build cost query
  let query = supabase
    .from("cost_entries")
    .select("*, vehicles!inner(make, model)", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (searchParams.vehicle_id) {
    query = query.eq("vehicle_id", searchParams.vehicle_id);
  }
  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }

  const { data: costEntries, count } = await query;

  const costs = (costEntries ?? []) as (CostEntry & {
    vehicles: { make: string; model: string };
  })[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Kosten</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Kosteneintraege verwalten</h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">Filtere nach Fahrzeug oder Kategorie, um Trends zu erkennen. Fuer schnelle Eingaben nutze den Button rechts.</p>
          </div>
          <Link
            href="/costs/new"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Neuer Eintrag
          </Link>
        </div>
      </section>

      <CostsFilter
        vehicles={allVehicles}
        selectedVehicle={searchParams.vehicle_id}
        selectedCategory={searchParams.category}
      />

      {costs.length === 0 ? (
        <p className="text-sm text-muted">Keine Kosteneinträge vorhanden.</p>
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
                      {CATEGORY_LABELS[c.category] ?? c.category}
                    </td>
                    <td className="py-2 pr-4">{c.title}</td>
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
                  href={`/costs?page=${page - 1}${searchParams.vehicle_id ? `&vehicle_id=${searchParams.vehicle_id}` : ""}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
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
                  href={`/costs?page=${page + 1}${searchParams.vehicle_id ? `&vehicle_id=${searchParams.vehicle_id}` : ""}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
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
