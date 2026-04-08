"use client";

import { useActionState } from "react";
import { createVehicle } from "./actions";

export function NewVehicleForm() {
  const [state, formAction, pending] = useActionState(createVehicle, {
    error: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          max={2100}
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="fuel_type" className="block text-sm font-medium text-foreground">
          Kraftstoff
        </label>
        <select
          id="fuel_type"
          name="fuel_type"
          required
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : "Fahrzeug anlegen"}
      </button>
    </form>
  );
}
