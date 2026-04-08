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
      ? `${vehicle.make} ${vehicle.model} — CarMan`
      : "Fahrzeug — CarMan",
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
      <div className="section-shell p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Fahrzeugprofil</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/vehicles"
            className="text-sm text-muted hover:text-foreground"
          >
            ← Fahrzeuge
          </Link>
          <h1 className="heading-display mt-1 text-3xl font-semibold text-foreground">
            {v.make} {v.model}
          </h1>
          <p className="text-sm text-muted">
            {v.year} · {FUEL_LABELS[v.fuel_type] ?? v.fuel_type} · {v.license_plate}
          </p>
          <p className="text-sm text-muted">
            Kilometerstand: {v.current_mileage.toLocaleString("de-DE")} km
          </p>
          <p className="mt-2 text-sm help-copy">Workflow: Kosten erfassen, neue Erinnerung setzen, dann offene Punkte im Erinnerungsblock pruefen.</p>
        </div>

        <VehicleActions vehicleId={v.id} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/costs/new?vehicle_id=${v.id}&category=fuel`}
          className="rounded-xl bg-success px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Tanken
        </Link>
        <Link
          href={`/costs/new?vehicle_id=${v.id}&category=maintenance`}
          className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Wartung
        </Link>
        <Link
          href={`/costs/new?vehicle_id=${v.id}`}
          className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-strong"
        >
          Kosten
        </Link>
        <Link
          href={`/reminders/new?vehicle_id=${v.id}`}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
        >
          Erinnerung
        </Link>
      </div>

      <section className="section-shell space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Letzte Kosten</h2>
        {recentCosts.length === 0 ? (
          <p className="text-sm text-muted">Keine Einträge vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted">Datum</th>
                  <th className="pb-2 pr-4 font-medium text-muted">Kategorie</th>
                  <th className="pb-2 pr-4 font-medium text-muted">Titel</th>
                  <th className="pb-2 text-right font-medium text-muted">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {recentCosts.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
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

      <section className="section-shell space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Erinnerungen</h2>
        {allReminders.length === 0 ? (
          <p className="text-sm text-muted">Keine Erinnerungen vorhanden.</p>
        ) : (
          <ul className="space-y-2">
            {allReminders.map((r) => (
              <li
                key={r.id}
                className={`rounded-md border p-3 ${
                  r.is_completed
                    ? "border-border/60 text-foreground/40 line-through"
                    : "border-border"
                }`}
              >
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted">
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
