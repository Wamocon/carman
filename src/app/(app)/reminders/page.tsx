import { createClient } from "@/lib/supabase/server";
import { DEFAULT_VEHICLE_STATUS } from "@/lib/vehicle-status";
import { formatDate } from "@/lib/utils";
import type { Reminder, Vehicle } from "@/types/domain";
import Link from "next/link";
import { ReminderToggle } from "./ReminderToggle";

export const metadata = {
  title: "Servicetermine — CarMan",
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
    .select("*, vehicles!inner(make, model, status)")
    .eq("user_id", user.id)
    .eq("vehicles.status", DEFAULT_VEHICLE_STATUS)
    .order("created_at", { ascending: false });

  if (!showCompleted) {
    query = query.eq("is_completed", false);
  }

  const [{ data: reminders }, { data: linkedCosts }] = await Promise.all([
    query,
    supabase
      .from("cost_entries")
      .select("id, reminder_id, vehicles!vehicle_id!inner(status)")
      .eq("user_id", user.id)
      .eq("vehicles.status", DEFAULT_VEHICLE_STATUS)
      .not("reminder_id", "is", null),
  ]);

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model")
    .eq("user_id", user.id)
    .eq("status", DEFAULT_VEHICLE_STATUS);

  const allVehicles = (vehicles ?? []) as Pick<Vehicle, "id" | "make" | "model">[];
  const allReminders = (reminders ?? []) as (Reminder & {
    vehicles: { make: string; model: string };
  })[];
  const linkedCostCountByReminder = (linkedCosts ?? []).reduce<Record<string, number>>((acc, entry) => {
    const reminderId = entry.reminder_id as string | null;
    if (!reminderId) {
      return acc;
    }
    acc[reminderId] = (acc[reminderId] ?? 0) + 1;
    return acc;
  }, {});

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
    <div className="space-y-6 stagger-children">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Servicetermine</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Servicetermine im Griff behalten</h1>
            <p className="mt-2 max-w-2xl text-sm help-copy">Nutze Datum, Kilometerstand oder beides. Erledigte Servicetermine kannst du jederzeit wieder öffnen.</p>
          </div>
          <Link
            href="/servicetermine/new"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Neuer Servicetermin
          </Link>
        </div>
      </section>

      <div>
        <Link
          href={`/servicetermine?show_completed=${showCompleted ? "false" : "true"}`}
          className="text-sm text-brand hover:underline"
        >
          {showCompleted ? "Erledigte ausblenden" : "Erledigte anzeigen"}
        </Link>
      </div>

      {allReminders.length === 0 ? (
        <p className="text-sm text-muted">Keine Servicetermine vorhanden.</p>
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
                      <div className={`flex-1 ${r.is_completed ? "text-foreground/40" : ""}`}>
                        <p className={`font-medium ${r.is_completed ? "line-through" : ""}`}>
                          {r.title}
                        </p>
                        <p className="text-sm text-muted">
                          {r.due_date && `Termin: ${formatDate(r.due_date)}`}
                          {r.due_date && r.due_mileage && " · "}
                          {r.due_mileage &&
                            `Bei ${r.due_mileage.toLocaleString("de-DE")} km`}
                        </p>
                        {r.notes && (
                          <p className="mt-1 text-sm text-muted">
                            {r.notes}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted">
                          Verknüpfte Kosten: {linkedCostCountByReminder[r.id] ?? 0}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <Link
                          href={`/servicetermine/${r.id}`}
                          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5"
                        >
                          Bearbeiten
                        </Link>
                        <Link
                          href={`/costs/new?vehicle_id=${r.vehicle_id}&category=maintenance&reminder_id=${r.id}&title=${encodeURIComponent(r.title)}&notes=${encodeURIComponent(`Erfasst aus Servicetermin: ${r.title}`)}`}
                          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-strong"
                        >
                          Kosten anhängen
                        </Link>
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


