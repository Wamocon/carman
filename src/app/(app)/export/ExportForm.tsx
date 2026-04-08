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
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={exporting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {exporting ? "Wird exportiert…" : "Als CSV exportieren"}
      </button>
    </form>
  );
}
