"use client";

import { useActionState, useState } from "react";
import { createReminder } from "./actions";
import type { Vehicle, ReminderType } from "@/types/domain";

export function NewReminderForm({
  vehicles,
  defaultVehicleId,
}: {
  vehicles: Vehicle[];
  defaultVehicleId?: string;
}) {
  const [state, formAction, pending] = useActionState(createReminder, {
    error: null as string | null,
  });
  const [reminderType, setReminderType] = useState<ReminderType>("date");

  const clampInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (!input.value) return;

    const value = Number(input.value);
    if (Number.isNaN(value)) return;

    if (input.max) {
      const max = Number(input.max);
      if (!Number.isNaN(max) && value > max) {
        input.value = String(max);
      }
    }
    if (input.min) {
      const min = Number(input.min);
      if (!Number.isNaN(min) && value < min) {
        input.value = String(min);
      }
    }
  };

  const showDate = reminderType === "date" || reminderType === "both";
  const showMileage = reminderType === "mileage" || reminderType === "both";

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="vehicle_id" className="block text-sm font-medium text-foreground">
          Fahrzeug
        </label>
        <select
          id="vehicle_id"
          name="vehicle_id"
          required
          defaultValue={defaultVehicleId ?? vehicles[0]?.id}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.model} ({v.license_plate})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Titel
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder="z.B. TÜV, Ölwechsel, Reifenwechsel"
        />
      </div>

      <div>
        <label htmlFor="reminder_type" className="block text-sm font-medium text-foreground">
          Erinnerungsart
        </label>
        <select
          id="reminder_type"
          name="reminder_type"
          required
          value={reminderType}
          onChange={(e) => setReminderType(e.target.value as ReminderType)}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="date">Datum</option>
          <option value="mileage">Kilometerstand</option>
          <option value="both">Beides</option>
        </select>
      </div>

      {showDate && (
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-foreground">
            Fälligkeitsdatum
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      )}

      {showMileage && (
        <div>
          <label htmlFor="due_mileage" className="block text-sm font-medium text-foreground">
            Kilometerstand
          </label>
          <input
            id="due_mileage"
            name="due_mileage"
            type="number"
            min={0}
            max={9999999}
            placeholder="150.000"
            onInput={clampInput}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">Maximal 7-stellig, z. B. 150.000 km</p>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notizen (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <p className="text-xs text-muted">Empfehlung: Bei wiederkehrender Wartung nutze den Typ &quot;Beides&quot;, um Datum und Laufleistung parallel abzusichern.</p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : "Erinnerung erstellen"}
      </button>
    </form>
  );
}
