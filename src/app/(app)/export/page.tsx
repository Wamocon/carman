import { createClient } from "@/lib/supabase/server";
import { isProFeature } from "@/lib/utils";
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
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Daten exportieren</h1>
        <div className="section-shell bg-amber-100/60 p-6 text-center">
          <p className="text-lg font-semibold text-amber-800">
            Pro-Funktion
          </p>
          <p className="mt-2 text-sm text-amber-800/85">
            Der Datenexport ist nur im Pro-Tarif verfügbar. Upgrade dein Konto,
            um deine Kosten als CSV zu exportieren.
          </p>
        </div>
      </div>
    );
  }

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model")
    .eq("user_id", user.id)
    .order("make");

  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model">[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Export</p>
        <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">CSV Export erstellen</h1>
        <p className="mt-2 text-sm help-copy">Waehle ein Fahrzeug oder exportiere alle Daten. Mit Datumsgrenzen begrenzt du den Bericht auf den gewuenschten Zeitraum.</p>
      </section>
      <section className="section-shell p-5 sm:p-6">
        <ExportForm vehicles={allVehicles} />
      </section>
    </div>
  );
}
