import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CostEntry, Vehicle } from "@/types/domain";
import { CostsFilter } from "./CostsFilter";

export const metadata = {
  title: "Kosten — Smart Car Manager",
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Kosten</h1>
        <Link
          href="/costs/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Neuer Eintrag
        </Link>
      </div>

      <CostsFilter
        vehicles={allVehicles}
        selectedVehicle={searchParams.vehicle_id}
        selectedCategory={searchParams.category}
      />

      {costs.length === 0 ? (
        <p className="text-sm text-foreground/60">Keine Kosteneinträge vorhanden.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-left">
                  <th className="pb-2 pr-4 font-medium text-foreground/60">Datum</th>
                  <th className="pb-2 pr-4 font-medium text-foreground/60">Kategorie</th>
                  <th className="pb-2 pr-4 font-medium text-foreground/60">Titel</th>
                  <th className="pb-2 pr-4 font-medium text-foreground/60">Fahrzeug</th>
                  <th className="pb-2 text-right font-medium text-foreground/60">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c) => (
                  <tr key={c.id} className="border-b border-foreground/5">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/costs?page=${page - 1}${searchParams.vehicle_id ? `&vehicle_id=${searchParams.vehicle_id}` : ""}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
                  className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
                >
                  Zurück
                </Link>
              )}
              <span className="text-sm text-foreground/60">
                Seite {page} von {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/costs?page=${page + 1}${searchParams.vehicle_id ? `&vehicle_id=${searchParams.vehicle_id}` : ""}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
                  className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
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
