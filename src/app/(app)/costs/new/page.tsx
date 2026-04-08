import { createClient } from "@/lib/supabase/server";
import type { Reminder, Vehicle } from "@/types/domain";
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

  const [{ data: vehicles }, { data: reminder }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("make"),
    searchParams.reminder_id
      ? supabase
          .from("reminders")
          .select("*")
          .eq("id", searchParams.reminder_id)
          .eq("user_id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const allVehicles = (vehicles ?? []) as Vehicle[];
  const reminderEntry = (reminder ?? null) as Reminder | null;

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

  if (searchParams.reminder_id && !reminderEntry) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="section-shell p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Workflow</p>
          <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Neuen Kosteneintrag erstellen</h1>
          <div className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
            Der angegebene Servicetermin wurde nicht gefunden oder gehört nicht zu deinem Konto. Bitte öffne den Vorgang erneut aus der Servicetermin-Ansicht.
          </div>
        </section>
      </div>
    );
  }

  const resolvedVehicleId = reminderEntry?.vehicle_id ?? searchParams.vehicle_id;
  const resolvedTitle = searchParams.title ?? reminderEntry?.title;
  const resolvedNotes = searchParams.notes ?? reminderEntry?.notes ?? undefined;

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
          defaultVehicleId={resolvedVehicleId}
          defaultCategory={searchParams.category}
          defaultReminderId={reminderEntry?.id}
          defaultTitle={resolvedTitle}
          defaultNotes={resolvedNotes}
          lockedVehicleId={reminderEntry?.vehicle_id}
        />
      </section>
    </div>
  );
}


