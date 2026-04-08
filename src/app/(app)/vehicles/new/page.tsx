import { createClient } from "@/lib/supabase/server";
import { canAddVehicle } from "@/lib/utils";
import type { UserProfile } from "@/types/domain";
import { NewVehicleForm } from "./NewVehicleForm";

export const metadata = {
  title: "Neues Fahrzeug — Smart Car Manager",
};

export default async function NewVehiclePage() {
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
        <div className="rounded-lg bg-amber-50 p-6 text-center dark:bg-amber-900/30">
          <p className="text-amber-700 dark:text-amber-400">
            Du hast das Fahrzeuglimit für den Free-Tarif erreicht. Upgrade auf
            Pro, um unbegrenzt Fahrzeuge hinzuzufügen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Neues Fahrzeug</h1>
      <NewVehicleForm />
    </div>
  );
}
