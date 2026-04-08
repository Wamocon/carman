import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Reminder, Vehicle } from "@/types/domain";
import Link from "next/link";
import { ReminderToggle } from "./ReminderToggle";

export const metadata = {
  title: "Erinnerungen — Smart Car Manager",
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Erinnerungen</h1>
        <Link
          href="/reminders/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Neue Erinnerung
        </Link>
      </div>

      <div>
        <Link
          href={`/reminders?show_completed=${showCompleted ? "false" : "true"}`}
          className="text-sm text-blue-600 hover:underline"
        >
          {showCompleted ? "Erledigte ausblenden" : "Erledigte anzeigen"}
        </Link>
      </div>

      {allReminders.length === 0 ? (
        <p className="text-sm text-foreground/60">Keine Erinnerungen vorhanden.</p>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([vehicleId, vehicleReminders]) => {
            const vehicleName = allVehicles.find((v) => v.id === vehicleId);
            return (
              <section key={vehicleId} className="space-y-3">
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
                          ? "border-foreground/5 bg-foreground/2"
                          : "border-foreground/10"
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
                        <p className="text-sm text-foreground/60">
                          {r.due_date && `Fällig: ${formatDate(r.due_date)}`}
                          {r.due_date && r.due_mileage && " · "}
                          {r.due_mileage &&
                            `Bei ${r.due_mileage.toLocaleString("de-DE")} km`}
                        </p>
                        {r.notes && (
                          <p className="mt-1 text-sm text-foreground/50">
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
