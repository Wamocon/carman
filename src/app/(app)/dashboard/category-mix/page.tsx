import Link from "next/link";
import { CategoryMixWidget } from "@/components/CategoryMixWidget";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import type { Locale } from "@/lib/preferences";

export const metadata = {
  title: "Kategorienmix groß — CarMan",
};

export default async function DashboardCategoryMixPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: costs } = await supabase
    .from("cost_entries")
    .select("category, amount, vehicles!vehicle_id!inner(status)")
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS);

  const rows = Array.from(
    (costs ?? []).reduce<Map<string, number>>((map, entry) => {
      map.set(entry.category, (map.get(entry.category) ?? 0) + entry.amount);
      return map;
    }, new Map()),
  )
    .map(([category, value]) => ({ category, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);

  const max = Math.max(...rows.map((row) => row.value), 0);
  const chartRows = rows.map((row) => ({
    ...row,
    width: max > 0 ? Math.max((row.value / max) * 100, 6) : 0,
  }));

  const locale: Locale = "de";

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Analyse</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Kategorienmix groß</h1>
            <p className="mt-2 text-sm help-copy">Die große Ansicht zeigt die stärksten Kostenkategorien auf Basis deiner aktuell gespeicherten Daten.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5">
            Zurück zum Dashboard
          </Link>
        </div>
      </section>

      <section className="section-shell p-5 sm:p-6">
        <CategoryMixWidget rows={chartRows} locale={locale} className="space-y-4" />
      </section>
    </div>
  );
}
