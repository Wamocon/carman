import Link from "next/link";
import { CostCumulativeExplorer } from "../../../../components/CostCumulativeExplorer";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import type { CostEntry, Vehicle } from "@/types/domain";

export const metadata = {
  title: "Kumulierter Kostenverlauf — CarMan",
};

export default async function DashboardCumulativeTrendPage() {
  const locale = await getLocaleFromCookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: costs }, { data: vehicles }] = await Promise.all([
    supabase
      .from("cost_entries")
      .select("*, vehicles!vehicle_id!inner(status)")
      .eq("user_id", user.id)
      .eq("vehicles.status", DEFAULT_VEHICLE_STATUS),
    supabase
      .from("vehicles")
      .select("id, make, model")
      .eq("user_id", user.id)
      .eq("status", DEFAULT_VEHICLE_STATUS),
  ]);

  const allCosts = (costs ?? []) as CostEntry[];
  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model">[];

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Analyse</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">
              {locale === "de" ? "Kumulierter Kostenverlauf" : "Cumulative cost trend"}
            </h1>
            <p className="mt-2 text-sm help-copy">
              {locale === "de"
                ? "Wähle Kategorien, Fahrzeuge und Zeitraum. Der Verlauf zeigt die aufgelaufenen Gesamtkosten."
                : "Select categories, vehicles and time range. The chart shows accumulated total costs."}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
          >
            {locale === "de" ? "Zurück zum Dashboard" : "Back to dashboard"}
          </Link>
        </div>
      </section>

      <section className="section-shell p-5 sm:p-6">
        <CostCumulativeExplorer costs={allCosts} vehicles={allVehicles} locale={locale} expanded />
      </section>
    </div>
  );
}
