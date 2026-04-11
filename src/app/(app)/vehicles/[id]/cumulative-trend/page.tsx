import Link from "next/link";
import { redirect } from "next/navigation";
import { CostCumulativeExplorer } from "@/components/CostCumulativeExplorer";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import type { CostEntry } from "@/types/domain";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("make, model")
    .eq("id", id)
    .single();
  return {
    title: vehicle
      ? `${vehicle.make} ${vehicle.model} · Kumulierter Verlauf — CarMan`
      : "Kumulierter Kostenverlauf — CarMan",
  };
}

export default async function VehicleCumulativeTrendPage(props: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, make, model")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    redirect("/vehicles");
  }

  const { data: costs } = await supabase
    .from("cost_entries")
    .select("*")
    .eq("vehicle_id", id)
    .order("date", { ascending: true });

  const vehicleCosts = (costs ?? []) as CostEntry[];

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Analyse</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {locale === "de" ? "Kumulierter Kostenverlauf" : "Cumulative cost trend"}
            </p>
            <p className="mt-2 text-sm help-copy">
              {locale === "de"
                ? "Wähle Kategorien und Zeitraum. Der Verlauf zeigt die aufgelaufenen Gesamtkosten für dieses Fahrzeug."
                : "Select categories and time range. The chart shows accumulated total costs for this vehicle."}
            </p>
          </div>
          <Link
            href={`/vehicles/${id}?tab=overview`}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
          >
            {locale === "de" ? "Zurück zum Fahrzeug" : "Back to vehicle"}
          </Link>
        </div>
      </section>

      <section className="section-shell p-5 sm:p-6">
        <CostCumulativeExplorer costs={vehicleCosts} locale={locale} expanded />
      </section>
    </div>
  );
}
