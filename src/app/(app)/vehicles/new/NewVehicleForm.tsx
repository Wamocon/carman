"use client";

import { useActionState } from "react";
import { createVehicle } from "./actions";

export function NewVehicleForm() {
  const [state, formAction, pending] = useActionState(createVehicle, {
    error: null as string | null,
  });
  const maxYear = new Date().getFullYear() + 1;

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

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="make" className="block text-sm font-medium text-foreground">
          Marke
        </label>
        <input
          id="make"
          name="make"
          type="text"
          required
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-foreground">
          Modell
        </label>
        <input
          id="model"
          name="model"
          type="text"
          required
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium text-foreground">
          Baujahr
        </label>
        <input
          id="year"
          name="year"
          type="number"
          required
          min={1900}
          max={maxYear}
          onInput={clampInput}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-xs text-muted">Erlaubter Bereich: 1900 bis {maxYear}</p>
      </div>

      <div>
        <label htmlFor="fuel_type" className="block text-sm font-medium text-foreground">
          Kraftstoff
        </label>
        <select
          id="fuel_type"
          name="fuel_type"
          required
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="petrol">Benzin</option>
          <option value="diesel">Diesel</option>
          <option value="electric">Elektro</option>
          <option value="hybrid">Hybrid</option>
          <option value="lpg">LPG</option>
          <option value="cng">CNG</option>
        </select>
      </div>

      <div>
        <label htmlFor="license_plate" className="block text-sm font-medium text-foreground">
          Kennzeichen
        </label>
        <input
          id="license_plate"
          name="license_plate"
          type="text"
          required
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <div>
        <label htmlFor="current_mileage" className="block text-sm font-medium text-foreground">
          Aktueller Kilometerstand
        </label>
        <input
          id="current_mileage"
          name="current_mileage"
          type="number"
          required
          min={0}
          max={9999999}
          placeholder="123.456"
          onInput={clampInput}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-xs text-muted">Maximal 7-stellig, z. B. 123.456 km</p>
      </div>

      <p className="text-xs text-muted">Hinweis: Der Kilometerstand wird bei neuen Kosten automatisch fortgeschrieben, wenn du dort eine hoehere Laufleistung angibst.</p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : "Fahrzeug anlegen"}
      </button>
    </form>
  );
}
