import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canAddVehicle } from "@/lib/utils";
import type { Vehicle, UserProfile } from "@/types/domain";

export const metadata = {
  title: "Fahrzeuge — CarMan",
};

export default async function VehiclesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: vehicles }, { data: profile }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  const allVehicles = (vehicles ?? []) as Vehicle[];
  const userProfile = profile as UserProfile | null;
  const tier = userProfile?.subscription_tier ?? "free";
  const canAdd = canAddVehicle(tier, allVehicles.length);

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Fahrzeuge</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Dein Fahrzeugbestand</h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">Lege fuer jedes Fahrzeug ein eigenes Profil an. Danach kannst du Kosten und Erinnerungen direkt zuordnen.</p>
          </div>
          {canAdd ? (
            <Link
              href="/vehicles/new"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
            >
              Neues Fahrzeug
            </Link>
          ) : (
            <div className="rounded-xl border border-amber-300/50 bg-amber-100/65 px-3 py-2 text-sm text-amber-800">
              Fahrzeuglimit erreicht, Pro fuer mehr Fahrzeuge
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Fahrzeugkarten</h2>
        <p className="text-xs text-muted">Tippe auf eine Karte fuer Details, Kosten und Erinnerungen.</p>
      </div>

      {allVehicles.length === 0 ? (
        <div className="section-shell border-dashed p-8 text-center">
          <p className="text-muted">Noch keine Fahrzeuge vorhanden.</p>
          <Link
            href="/vehicles/new"
            className="mt-3 inline-block rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Erstes Fahrzeug hinzufügen
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allVehicles.map((v) => (
            <Link
              key={v.id}
              href={`/vehicles/${v.id}`}
              className="surface block rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:bg-foreground/5"
            >
              <p className="font-semibold">
                {v.make} {v.model}
              </p>
              <p className="text-sm text-muted">
                {v.year} · {v.fuel_type}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm text-muted">
                <span>{v.license_plate}</span>
                <span>{v.current_mileage.toLocaleString("de-DE")} km</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
