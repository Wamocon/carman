"use client";

import { useActionState, useState } from "react";
import { createCostEntry } from "./actions";
import type { Vehicle, CostCategory } from "@/types/domain";

const CATEGORY_OPTIONS: { value: CostCategory; label: string }[] = [
  { value: "fuel", label: "Tanken" },
  { value: "maintenance", label: "Wartung" },
  { value: "repair", label: "Reparatur" },
  { value: "insurance", label: "Versicherung" },
  { value: "tax", label: "Steuer" },
  { value: "leasing", label: "Leasing" },
  { value: "parking", label: "Parken" },
  { value: "other", label: "Sonstiges" },
];

export function NewCostForm({
  vehicles,
  defaultVehicleId,
  defaultCategory,
}: {
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  defaultCategory?: string;
}) {
  const [state, formAction, pending] = useActionState(createCostEntry, {
    error: null as string | null,
  });
  const [category, setCategory] = useState(defaultCategory ?? "fuel");

  const isFuel = category === "fuel";

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
        <label htmlFor="category" className="block text-sm font-medium text-foreground">
          Kategorie
        </label>
        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value as CostCategory)}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground">
            Betrag (€)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            required
            min={0}
            max={999999.99}
            step="0.01"
            placeholder="24,95"
            onInput={clampInput}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-1 text-xs text-muted">Beispiel: 24,95 EUR</p>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground">
            Datum
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="mileage" className="block text-sm font-medium text-foreground">
          Kilometerstand (optional)
        </label>
        <input
          id="mileage"
          name="mileage"
          type="number"
          min={0}
          max={9999999}
          placeholder="123.456"
          onInput={clampInput}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-xs text-muted">Maximal 7-stellig, z. B. 123.456 km</p>
      </div>

      {isFuel && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="liters" className="block text-sm font-medium text-foreground">
              Liter
            </label>
            <input
              id="liters"
              name="liters"
              type="number"
              min={0}
              max={999.999}
              step="0.01"
              placeholder="48,20"
              onInput={clampInput}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <p className="mt-1 text-xs text-muted">Maximal 3-stellig, z. B. 48,20 l</p>
          </div>

          <div>
            <label htmlFor="price_per_liter" className="block text-sm font-medium text-foreground">
              Preis/Liter (€)
            </label>
            <input
              id="price_per_liter"
              name="price_per_liter"
              type="number"
              min={0}
              max={99.999}
              step="0.001"
              placeholder="1,729"
              onInput={clampInput}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
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

      <p className="text-xs text-muted">Profi-Tipp: Trage beim Tanken immer den Kilometerstand ein. So bleiben Verbrauch und Wartungszyklen belastbar.</p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : "Eintrag speichern"}
      </button>
    </form>
  );
}
