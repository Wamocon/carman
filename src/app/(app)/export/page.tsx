import { createClient } from "@/lib/supabase/server";
import { isProFeature } from "@/lib/utils";
import type { UserProfile, Vehicle } from "@/types/domain";
import { ExportForm } from "./ExportForm";

export const metadata = {
  title: "Export — Smart Car Manager",
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
        <div className="rounded-lg bg-amber-50 p-6 text-center dark:bg-amber-900/30">
          <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">
            Pro-Funktion
          </p>
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400/80">
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
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Daten exportieren</h1>
      <ExportForm vehicles={allVehicles} />
    </div>
  );
}
