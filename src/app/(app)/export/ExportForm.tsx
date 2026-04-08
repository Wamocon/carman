"use client";

import { useState } from "react";
import type { Vehicle } from "@/types/domain";
import { exportCosts } from "./actions";

export function ExportForm({
  vehicles,
}: {
  vehicles: Pick<Vehicle, "id" | "make" | "model">[];
}) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setExporting(true);
    setError(null);
    const result = await exportCosts(formData);

    if ("error" in result) {
      setError(result.error);
      setExporting(false);
      return;
    }

    // Create and download CSV
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kosten-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="vehicle_id" className="block text-sm font-medium text-foreground">
          Fahrzeug
        </label>
        <select
          id="vehicle_id"
          name="vehicle_id"
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">Alle Fahrzeuge</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.model}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="from_date" className="block text-sm font-medium text-foreground">
            Von
          </label>
          <input
            id="from_date"
            name="from_date"
            type="date"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div>
          <label htmlFor="to_date" className="block text-sm font-medium text-foreground">
            Bis
          </label>
          <input
            id="to_date"
            name="to_date"
            type="date"
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      <p className="text-xs text-muted">Export-Datei: CSV mit Datum, Kategorie, Titel, Betrag sowie optionalen Tank- und Kilometerdaten.</p>

      <button
        type="submit"
        disabled={exporting}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {exporting ? "Wird exportiert…" : "Als CSV exportieren"}
      </button>
    </form>
  );
}
