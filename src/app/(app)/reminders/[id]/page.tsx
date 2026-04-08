import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CostEntry, Reminder, Vehicle } from "@/types/domain";
import { submitLinkReminderToCost, updateReminder } from "../actions";
import { NewReminderForm } from "../new/NewReminderForm";

const CATEGORY_LABELS: Record<string, string> = {
  fuel: "Tanken",
  maintenance: "Wartung",
  repair: "Reparatur",
  insurance: "Versicherung",
  tax: "Steuer",
  leasing: "Leasing",
  parking: "Parken",
  other: "Sonstiges",
};

export const metadata = {
  title: "Servicetermin bearbeiten — CarMan",
};

export default async function ReminderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: reminder }, { data: vehicles }] = await Promise.all([
    supabase
      .from("reminders")
      .select("*, vehicles!inner(make, model, license_plate)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase.from("vehicles").select("*").eq("user_id", user.id).order("make"),
  ]);

  if (!reminder) {
    notFound();
  }

  const currentReminder = reminder as Reminder & {
    vehicles: Pick<Vehicle, "make" | "model" | "license_plate">;
  };
  const allVehicles = (vehicles ?? []) as Vehicle[];

  const [{ data: linkedCosts }, { data: availableCosts }] = await Promise.all([
    supabase
      .from("cost_entries")
      .select("id, vehicle_id, category, title, amount, date")
      .eq("user_id", user.id)
      .eq("reminder_id", currentReminder.id)
      .order("date", { ascending: false }),
    supabase
      .from("cost_entries")
      .select("id, vehicle_id, category, title, amount, date")
      .eq("user_id", user.id)
      .eq("vehicle_id", currentReminder.vehicle_id)
      .is("reminder_id", null)
      .order("date", { ascending: false })
      .limit(20),
  ]);

  const linkedCostEntries = (linkedCosts ?? []) as Pick<CostEntry, "id" | "vehicle_id" | "category" | "title" | "amount" | "date">[];
  const selectableCosts = (availableCosts ?? []) as Pick<CostEntry, "id" | "vehicle_id" | "category" | "title" | "amount" | "date">[];

  const defaultCostCategory = currentReminder.title.toLowerCase().includes("öl")
    || currentReminder.title.toLowerCase().includes("service")
    || currentReminder.title.toLowerCase().includes("wartung")
    ? "maintenance"
    : "other";

  const defaultCostNotes = `Erfasst aus Servicetermin: ${currentReminder.title}`;

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/servicetermine" className="text-sm text-muted hover:text-foreground">
              ← Zurück zu Serviceterminen
            </Link>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">{currentReminder.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {currentReminder.vehicles.make} {currentReminder.vehicles.model} ({currentReminder.vehicles.license_plate})
            </p>
          </div>
          <Link
            href={`/costs/new?vehicle_id=${currentReminder.vehicle_id}&category=${defaultCostCategory}&reminder_id=${currentReminder.id}&title=${encodeURIComponent(currentReminder.title)}&notes=${encodeURIComponent(defaultCostNotes)}`}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Kosten aus diesem Servicetermin erfassen
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Status</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{currentReminder.is_completed ? "Erledigt" : "Offen"}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Datum</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{currentReminder.due_date ? formatDate(currentReminder.due_date) : "-"}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Kilometer</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{currentReminder.due_mileage ? `${currentReminder.due_mileage.toLocaleString("de-DE")} km` : "-"}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Verknüpfte Kosten</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{linkedCostEntries.length}</p>
        </div>
      </section>

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Servicetermin bearbeiten</h2>
          <p className="mt-1 text-sm text-muted">Passe Termin, Laufleistung und Status an. Die globalen Fahrzeuginformationen bleiben erhalten, die Aufgabe selbst bleibt fokussiert bearbeitbar.</p>
        </div>
        <NewReminderForm
          vehicles={allVehicles}
          reminder={currentReminder}
          action={updateReminder}
          submitLabel="Änderungen speichern"
          pendingLabel="Wird aktualisiert..."
          showCompletionToggle
        />
      </section>

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Kosten verknüpfen</h2>
          <p className="mt-1 text-sm text-muted">Nutze einen bestehenden Kosteneintrag oder erfasse direkt einen neuen. Beim Verknüpfen wird der Servicetermin automatisch als erledigt markiert.</p>
        </div>

        <form action={submitLinkReminderToCost} className="grid gap-3 rounded-xl border border-border/70 bg-card/60 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <input type="hidden" name="reminder_id" value={currentReminder.id} />
          <div>
            <label htmlFor="cost_entry_id" className="block text-sm font-medium text-foreground">Bestehenden Eintrag auswählen</label>
            <select id="cost_entry_id" name="cost_entry_id" defaultValue="" className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground">
              <option value="">Bitte wählen</option>
              {selectableCosts.map((costEntry) => (
                <option key={costEntry.id} value={costEntry.id}>
                  {formatDate(costEntry.date)} - {costEntry.title} ({formatCurrency(costEntry.amount)})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5">
            Bestehenden Eintrag verknüpfen
          </button>
        </form>

        {linkedCostEntries.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Kosten mit diesem Servicetermin verknüpft.</p>
        ) : (
          <ul className="space-y-2">
            {linkedCostEntries.map((costEntry) => (
              <li key={costEntry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{costEntry.title}</p>
                  <p className="text-xs text-muted">{CATEGORY_LABELS[costEntry.category] ?? costEntry.category} · {formatDate(costEntry.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{formatCurrency(costEntry.amount)}</span>
                  <Link href={`/costs/${costEntry.id}`} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5">
                    Öffnen
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}