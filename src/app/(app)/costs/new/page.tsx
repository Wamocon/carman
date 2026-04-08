import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/types/domain";
import { NewCostForm } from "./NewCostForm";

export const metadata = {
  title: "Neuer Kosteneintrag — Smart Car Manager",
};

export default async function NewCostPage(props: {
  searchParams: Promise<{ vehicle_id?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", user.id)
    .order("make");

  const allVehicles = (vehicles ?? []) as Vehicle[];

  if (allVehicles.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Neuer Kosteneintrag</h1>
        <p className="text-foreground/60">
          Du musst zuerst ein Fahrzeug anlegen, bevor du Kosten erfassen kannst.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Neuer Kosteneintrag</h1>
      <NewCostForm
        vehicles={allVehicles}
        defaultVehicleId={searchParams.vehicle_id}
        defaultCategory={searchParams.category}
      />
    </div>
  );
}
