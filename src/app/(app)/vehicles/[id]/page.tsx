import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Vehicle, CostEntry, Reminder } from "@/types/domain";
import { VehicleActions } from "./VehicleActions";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("make, model")
    .eq("id", id)
    .single();

  return {
    title: vehicle
      ? `${vehicle.make} ${vehicle.model} — Smart Car Manager`
      : "Fahrzeug — Smart Car Manager",
  };
}

export default async function VehicleDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    redirect("/vehicles");
  }

  const v = vehicle as Vehicle;

  const [{ data: costs }, { data: reminders }] = await Promise.all([
    supabase
      .from("cost_entries")
      .select("*")
      .eq("vehicle_id", id)
      .order("date", { ascending: false })
      .limit(10),
    supabase
      .from("reminders")
      .select("*")
      .eq("vehicle_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const recentCosts = (costs ?? []) as CostEntry[];
  const allReminders = (reminders ?? []) as Reminder[];

  const FUEL_LABELS: Record<string, string> = {
    petrol: "Benzin",
    diesel: "Diesel",
    electric: "Elektro",
    hybrid: "Hybrid",
    lpg: "LPG",
    cng: "CNG",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/vehicles"
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            ← Fahrzeuge
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {v.make} {v.model}
          </h1>
          <p className="text-sm text-foreground/60">
            {v.year} · {FUEL_LABELS[v.fuel_type] ?? v.fuel_type} · {v.license_plate}
          </p>
          <p className="text-sm text-foreground/60">
            Kilometerstand: {v.current_mileage.toLocaleString("de-DE")} km
          </p>
        </div>

        <VehicleActions vehicleId={v.id} />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/costs/new?vehicle_id=${v.id}&category=fuel`}
          className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Tanken
        </Link>
        <Link
          href={`/costs/new?vehicle_id=${v.id}&category=maintenance`}
          className="rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Wartung
        </Link>
        <Link
          href={`/costs/new?vehicle_id=${v.id}`}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Kosten
        </Link>
        <Link
          href={`/reminders/new?vehicle_id=${v.id}`}
          className="rounded-md border border-foreground/20 px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
        >
          Erinnerung
        </Link>
      </div>

      {/* Recent costs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Letzte Kosten</h2>
        {recentCosts.length === 0 ? (
          <p className="text-sm text-foreground/60">Keine Einträge vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-left">
                  <th className="pb-2 pr-4 font-medium text-foreground/60">Datum</th>
                  <th className="pb-2 pr-4 font-medium text-foreground/60">Kategorie</th>
                  <th className="pb-2 pr-4 font-medium text-foreground/60">Titel</th>
                  <th className="pb-2 text-right font-medium text-foreground/60">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {recentCosts.map((c) => (
                  <tr key={c.id} className="border-b border-foreground/5">
                    <td className="py-2 pr-4">{formatDate(c.date)}</td>
                    <td className="py-2 pr-4 capitalize">{c.category}</td>
                    <td className="py-2 pr-4">{c.title}</td>
                    <td className="py-2 text-right">{formatCurrency(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reminders */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Erinnerungen</h2>
        {allReminders.length === 0 ? (
          <p className="text-sm text-foreground/60">Keine Erinnerungen vorhanden.</p>
        ) : (
          <ul className="space-y-2">
            {allReminders.map((r) => (
              <li
                key={r.id}
                className={`rounded-md border p-3 ${
                  r.is_completed
                    ? "border-foreground/5 text-foreground/40 line-through"
                    : "border-foreground/10"
                }`}
              >
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-foreground/60">
                  {r.due_date && `Fällig: ${formatDate(r.due_date)}`}
                  {r.due_date && r.due_mileage && " · "}
                  {r.due_mileage &&
                    `Bei ${r.due_mileage.toLocaleString("de-DE")} km`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
