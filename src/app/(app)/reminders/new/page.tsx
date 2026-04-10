import { createClient } from "@/lib/supabase/server";
import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import type { Vehicle } from "@/types/domain";
import { NewReminderForm } from "./NewReminderForm";

export const metadata = {
  title: "Neuer Servicetermin — CarMan",
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
    .eq("status", DEFAULT_VEHICLE_STATUS)
    .order("make");

  const allVehicles = (vehicles ?? []) as Vehicle[];

  if (allVehicles.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Neuer Servicetermin</h1>
        <p className="text-muted">
          Du musst zuerst ein Fahrzeug anlegen.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Servicetermin</p>
        <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Neuen Servicetermin anlegen</h1>
        <p className="mt-2 text-sm help-copy">Lege Servicefenster nach Datum oder Kilometerstand fest. So bleibt keine Wartung ungeplant.</p>
      </section>
      <section className="section-shell p-5 sm:p-6">
        <NewReminderForm
          vehicles={allVehicles}
          defaultVehicleId={searchParams.vehicle_id}
        />
      </section>
    </div>
  );
}


