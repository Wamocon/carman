import Link from "next/link";
import { CostTrendExplorer } from "../../../../components/CostTrendExplorer";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import type { CostEntry, Vehicle } from "@/types/domain";

export const metadata = {
  title: "Kostenverlauf groß — CarMan",
};

export default async function DashboardCostTrendPage() {
  const locale = await getLocaleFromCookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: costs }, { data: vehicles }] = await Promise.all([
    supabase.from("cost_entries").select("*").eq("user_id", user.id),
    supabase.from("vehicles").select("id, make, model").eq("user_id", user.id),
  ]);

  const allCosts = (costs ?? []) as CostEntry[];
  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model">[];

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Analyse</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Kostenverlauf groß</h1>
            <p className="mt-2 text-sm help-copy">Wähle Kategorien, Fahrzeuge und Zeitraum. Alle Werte bleiben auf Monatsbasis.</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </section>

      <section className="section-shell p-5 sm:p-6">
        <CostTrendExplorer costs={allCosts} vehicles={allVehicles} locale={locale} expanded />
      </section>
    </div>
  );
}


