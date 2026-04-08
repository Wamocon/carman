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

  const showDate = reminderType === "date" || reminderType === "both";
  const showMileage = reminderType === "mileage" || reminderType === "both";

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : "Erinnerung erstellen"}
      </button>
    </form>
  );
}
