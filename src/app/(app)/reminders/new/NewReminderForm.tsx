"use client";

import { useActionState, useState } from "react";
import { createReminder } from "./actions";
import type { Reminder, Vehicle, ReminderType } from "@/types/domain";

type ReminderFormState = {
  error: string | null;
  success: string | null;
};

type ReminderFormAction = (
  prevState: ReminderFormState,
  formData: FormData,
) => Promise<ReminderFormState>;

const createReminderAction: ReminderFormAction = async (_prevState, formData) => {
  const result = await createReminder({ error: null }, formData);

  return {
    error: result?.error ?? null,
    success: null,
  };
};

export function NewReminderForm({
  vehicles,
  defaultVehicleId,
  reminder,
  action,
  submitLabel,
  pendingLabel,
  showCompletionToggle = false,
}: {
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  reminder?: Reminder;
  action?: ReminderFormAction;
  submitLabel?: string;
  pendingLabel?: string;
  showCompletionToggle?: boolean;
}) {
  const actionToUse = action ?? createReminderAction;
  const [state, formAction, pending] = useActionState(actionToUse, {
    error: null,
    success: null,
  });
  const [reminderType, setReminderType] = useState<ReminderType>(reminder?.reminder_type ?? "date");

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
      {reminder ? <input type="hidden" name="reminder_id" value={reminder.id} /> : null}

      {state.error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      {state.success ? (
        <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
          {state.success}
        </div>
      ) : null}

      <div>
        <label htmlFor="vehicle_id" className="block text-sm font-medium text-foreground">
          Fahrzeug
        </label>
        <select
          id="vehicle_id"
          name="vehicle_id"
          required
          defaultValue={reminder?.vehicle_id ?? defaultVehicleId ?? vehicles[0]?.id}
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
          defaultValue={reminder?.title}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder="z.B. TÜV, Ölwechsel, Reifenwechsel"
        />
      </div>

      <div>
        <label htmlFor="reminder_type" className="block text-sm font-medium text-foreground">
          Terminart
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
            Service-Datum
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={reminder?.due_date ?? ""}
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
            defaultValue={reminder?.due_mileage ?? undefined}
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
          defaultValue={reminder?.notes ?? ""}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {showCompletionToggle ? (
        <label className="flex items-start gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="is_completed"
            value="true"
            defaultChecked={reminder?.is_completed ?? false}
            className="mt-0.5"
          />
          <span>Servicetermin als erledigt markieren</span>
        </label>
      ) : null}

      <p className="text-xs text-muted">Empfehlung: Bei wiederkehrender Wartung nutze den Typ &quot;Beides&quot;, um Datum und Laufleistung parallel abzusichern.</p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? (pendingLabel ?? "Wird gespeichert...") : (submitLabel ?? "Servicetermin erstellen")}
      </button>
    </form>
  );
}


