import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/types/domain";
import { NewReminderForm } from "./NewReminderForm";

export const metadata = {
  title: "Neue Erinnerung — Smart Car Manager",
};

export default async function NewReminderPage(props: {
  searchParams: Promise<{ vehicle_id?: string }>;
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
        <h1 className="text-2xl font-bold text-foreground">Neue Erinnerung</h1>
        <p className="text-foreground/60">
          Du musst zuerst ein Fahrzeug anlegen.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Neue Erinnerung</h1>
      <NewReminderForm
        vehicles={allVehicles}
        defaultVehicleId={searchParams.vehicle_id}
      />
    </div>
  );
}
