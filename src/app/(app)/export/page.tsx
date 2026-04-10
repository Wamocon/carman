import { ProUpgradeBanner } from "@/components/ProUpgradeBanner";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import { isProFeature } from "@/lib/utils";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import type { UserProfile, Vehicle } from "@/types/domain";
import { ExportForm } from "./ExportForm";

export const metadata = {
  title: "Export — CarMan",
};

export default async function ExportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile = profile as UserProfile | null;
  const tier = userProfile?.subscription_tier ?? "free";

  if (isProFeature(tier)) {
    const locale = await getLocaleFromCookies();
    return (
      <div className="space-y-4 stagger-children">
        <h1 className="text-2xl font-bold text-foreground">Daten exportieren</h1>
        <ProUpgradeBanner locale={locale} />
      </div>
    );
  }

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, status")
    .eq("user_id", user.id)
    .eq("status", DEFAULT_VEHICLE_STATUS)
    .order("make");

  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model" | "status">[];

  return (
    <div className="mx-auto max-w-3xl space-y-6 stagger-children">
      <section className="section-shell p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Export</p>
        <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">CSV-Export erstellen</h1>
        <p className="mt-2 text-sm help-copy">Wähle ein Fahrzeug oder exportiere alle Daten. Mit Datumsgrenzen begrenzt du den Bericht auf den gewünschten Zeitraum.</p>
      </section>
      <section className="section-shell p-5 sm:p-6">
        <ExportForm vehicles={allVehicles} />
      </section>
    </div>
  );
}


