import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canAddVehicle } from "@/lib/utils";
import type { Vehicle, UserProfile } from "@/types/domain";

export const metadata = {
  title: "Fahrzeuge — Smart Car Manager",
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Fahrzeuge</h1>
        {canAdd ? (
          <Link
            href="/vehicles/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Neues Fahrzeug
          </Link>
        ) : (
          <div className="text-right">
            <span className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Fahrzeuglimit erreicht — upgrade auf Pro
            </span>
          </div>
        )}
      </div>

      {allVehicles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-foreground/20 p-8 text-center">
          <p className="text-foreground/60">Noch keine Fahrzeuge vorhanden.</p>
          <Link
            href="/vehicles/new"
            className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
              className="block rounded-lg border border-foreground/10 p-4 transition-colors hover:bg-foreground/5"
            >
              <p className="font-semibold">
                {v.make} {v.model}
              </p>
              <p className="text-sm text-foreground/60">
                {v.year} · {v.fuel_type}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm text-foreground/60">
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
