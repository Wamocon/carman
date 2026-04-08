import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Reminder, Vehicle } from "@/types/domain";
import Link from "next/link";
import { ReminderToggle } from "./ReminderToggle";

export const metadata = {
  title: "Erinnerungen — CarMan",
};

export default async function RemindersPage(props: {
  searchParams: Promise<{ show_completed?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const showCompleted = searchParams.show_completed === "true";

  let query = supabase
    .from("reminders")
    .select("*, vehicles!inner(make, model)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!showCompleted) {
    query = query.eq("is_completed", false);
  }

  const { data: reminders } = await query;

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model")
    .eq("user_id", user.id);

  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model">[];
  const allReminders = (reminders ?? []) as (Reminder & {
    vehicles: { make: string; model: string };
  })[];

  // Group by vehicle
  const grouped = new Map<string, typeof allReminders>();
  for (const r of allReminders) {
    const key = r.vehicle_id;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(r);
  }

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Erinnerungen</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Faelligkeiten im Griff behalten</h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">Nutze Datum, Kilometerstand oder beides. Erledigte Aufgaben kannst du jederzeit wieder oeffnen.</p>
          </div>
          <Link
            href="/reminders/new"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Neue Erinnerung
          </Link>
        </div>
      </section>

      <div>
        <Link
          href={`/reminders?show_completed=${showCompleted ? "false" : "true"}`}
          className="text-sm text-brand hover:underline"
        >
          {showCompleted ? "Erledigte ausblenden" : "Erledigte anzeigen"}
        </Link>
      </div>

      {allReminders.length === 0 ? (
        <p className="text-sm text-muted">Keine Erinnerungen vorhanden.</p>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([vehicleId, vehicleReminders]) => {
            const vehicleName = allVehicles.find((v) => v.id === vehicleId);
            return (
              <section key={vehicleId} className="section-shell space-y-3 p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {vehicleName
                    ? `${vehicleName.make} ${vehicleName.model}`
                    : "Fahrzeug"}
                </h2>
                <ul className="space-y-2">
                  {vehicleReminders.map((r) => (
                    <li
                      key={r.id}
                      className={`flex items-start gap-3 rounded-md border p-3 ${
                        r.is_completed
                          ? "border-border/60 bg-foreground/5"
                          : "border-border"
                      }`}
                    >
                      <ReminderToggle
                        reminderId={r.id}
                        isCompleted={r.is_completed}
                      />
                      <div className={r.is_completed ? "text-foreground/40" : ""}>
                        <p className={`font-medium ${r.is_completed ? "line-through" : ""}`}>
                          {r.title}
                        </p>
                        <p className="text-sm text-muted">
                          {r.due_date && `Fällig: ${formatDate(r.due_date)}`}
                          {r.due_date && r.due_mileage && " · "}
                          {r.due_mileage &&
                            `Bei ${r.due_mileage.toLocaleString("de-DE")} km`}
                        </p>
                        {r.notes && (
                          <p className="mt-1 text-sm text-muted">
                            {r.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
