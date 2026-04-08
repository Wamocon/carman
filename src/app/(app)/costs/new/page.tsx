import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/types/domain";
import { NewCostForm } from "./NewCostForm";

export const metadata = {
  title: "Neuer Kosteneintrag — CarMan",
};

export default async function NewCostPage(props: {
  searchParams: Promise<{
    vehicle_id?: string;
    category?: string;
    reminder_id?: string;
    title?: string;
    notes?: string;
  }>;
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
        <p className="text-muted">
          Du musst zuerst ein Fahrzeug anlegen, bevor du Kosten erfassen kannst.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Workflow</p>
        <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Neuen Kosteneintrag erstellen</h1>
        <p className="mt-2 text-sm help-copy">Wähle zuerst das Fahrzeug, dann die Kategorie. Bei Tankvorgängen kannst du Liter und Preis pro Liter für spätere Verbrauchsanalysen erfassen.</p>
      </section>
      <section className="section-shell p-5 sm:p-6">
        <NewCostForm
          vehicles={allVehicles}
          defaultVehicleId={searchParams.vehicle_id}
          defaultCategory={searchParams.category}
          defaultReminderId={searchParams.reminder_id}
          defaultTitle={searchParams.title}
          defaultNotes={searchParams.notes}
        />
      </section>
    </div>
  );
}


