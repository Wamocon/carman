"use client";

import { useActionState, useState } from "react";
import type { CostCategory, CostEntry, PaymentStatus } from "@/types/domain";
import { updateCostEntry } from "./actions";

const CATEGORY_OPTIONS: { value: CostCategory; label: string }[] = [
  { value: "acquisition", label: "Anschaffung" },
  { value: "fuel", label: "Tanken" },
  { value: "maintenance", label: "Wartung" },
  { value: "repair", label: "Reparatur" },
  { value: "insurance", label: "Versicherung" },
  { value: "tax", label: "Steuer" },
  { value: "leasing", label: "Leasing" },
  { value: "financing", label: "Finanzierung" },
  { value: "parking", label: "Parken" },
  { value: "other", label: "Sonstiges" },
];

export function EditCostForm({ costEntry }: { costEntry: CostEntry }) {
  const [state, formAction, pending] = useActionState(updateCostEntry, {
    error: null as string | null,
    success: null as string | null,
  });
  const [category, setCategory] = useState<CostCategory>(costEntry.category);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(costEntry.payment_status);
  const isVehicleSale = costEntry.is_vehicle_sale;

  const isFuel = category === "fuel";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="cost_entry_id" value={costEntry.id} />

      {state.error ? (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
          {state.success}
        </div>
      ) : null}

      {isVehicleSale ? (
        <div>
          <input type="hidden" name="category" value="other" />
          <label className="block text-sm font-medium text-foreground">Kategorie</label>
          <div className="mt-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground">
            Fahrzeugverkauf
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground">
            Kategorie
          </label>
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value as CostCategory)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Titel
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={costEntry.title}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground">
            {isVehicleSale ? "Verkaufserlös (negativ)" : "Betrag (€)"}
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            required
            min={isVehicleSale ? -999999.99 : 0}
            max={999999.99}
            step="0.01"
            defaultValue={costEntry.amount}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
          />
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
            defaultValue={costEntry.date}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
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
          defaultValue={costEntry.mileage ?? ""}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      {isFuel && !isVehicleSale ? (
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
              defaultValue={costEntry.liters ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
            />
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
              defaultValue={costEntry.price_per_liter ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor="payment_status" className="block text-sm font-medium text-foreground">
          Zahlungsstatus
        </label>
        <select
          id="payment_status"
          name="payment_status"
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
        >
          <option value="open">Offen</option>
          <option value="paid">Bezahlt</option>
        </select>
        <p className="mt-1 text-xs text-muted">Nur bezahlte Kosten werden in Summen und Übersichten eingerechnet.</p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notizen (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={costEntry.notes ?? ""}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird gespeichert..." : "Änderungen speichern"}
      </button>
    </form>
  );
}
