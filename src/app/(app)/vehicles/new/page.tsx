import { createClient } from "@/lib/supabase/server";
import { canAddVehicle } from "@/lib/utils";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import type { UserProfile } from "@/types/domain";
import { NewVehicleForm } from "./NewVehicleForm";

export const metadata = {
  title: "Neues Fahrzeug — CarMan",
};

export default async function NewVehiclePage() {
  const locale = await getLocaleFromCookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const userProfile = profile as UserProfile | null;
  const tier = userProfile?.subscription_tier ?? "free";
  const vehicleCount = count ?? 0;

  if (!canAddVehicle(tier, vehicleCount)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Neues Fahrzeug</h1>
        <div className="section-shell bg-amber-100/60 p-6 text-center">
          <p className="text-amber-800">
            Du hast das Fahrzeuglimit für den Free-Tarif erreicht. Upgrade auf
            Pro, um unbegrenzt Fahrzeuge hinzuzufügen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Setup</p>
        <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Neues Fahrzeug anlegen</h1>
        <p className="mt-2 text-sm help-copy">Nutze VIN, Vorschläge für Marke und Modell sowie optionale Detailfelder, um dein Fahrzeug möglichst vollständig mit wenig Zeitaufwand abzubilden.</p>
      </section>

      <section className="section-shell p-5 sm:p-6">
      <NewVehicleForm locale={locale} />
      </section>
    </div>
  );
}


