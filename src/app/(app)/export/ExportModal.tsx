"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Vehicle } from "@/types/domain";
import { exportCosts } from "./actions";

const CATEGORY_OPTIONS = [
  { value: "fuel", label: "Tanken" },
  { value: "maintenance", label: "Wartung" },
  { value: "repair", label: "Reparatur" },
  { value: "insurance", label: "Versicherung" },
  { value: "tax", label: "Steuer" },
  { value: "leasing", label: "Leasing" },
  { value: "parking", label: "Parken" },
  { value: "other", label: "Sonstiges" },
] as const;

export function ExportModal({
  vehicles,
  onClose,
  initialVehicleId,
  initialCategory,
  initialStartDate,
  initialEndDate,
}: {
  vehicles: Pick<Vehicle, "id" | "make" | "model" | "status">[];
  onClose: () => void;
  initialVehicleId?: string;
  initialCategory?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => { dialog.close(); };
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onCancel(e: Event) {
      e.preventDefault();
      handleClose();
    }

    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [handleClose]);

  async function handleSubmit(formData: FormData) {
    setExporting(true);
    setError(null);
    setSuccess(false);
    const result = await exportCosts(formData);

    if ("error" in result) {
      setError(result.error);
      setExporting(false);
      return;
    }

    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kosten-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    setSuccess(true);
  }

  return (
    <dialog
      ref={dialogRef}
      className="animate-fade-in m-auto w-full max-w-lg rounded-2xl border border-border bg-background p-0 text-foreground backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CSV Export</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Kosten exportieren</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-border p-1.5 text-muted transition hover:bg-foreground/5 hover:text-foreground"
            aria-label="Schließen"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="animate-fade-in space-y-4">
            <div className="rounded-xl border border-success/20 bg-success/10 p-4 text-center">
              <svg className="mx-auto mb-2 h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-success">Export erfolgreich!</p>
              <p className="mt-1 text-xs text-muted">Die CSV-Datei wurde heruntergeladen.</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted">
              Die aktuellen Filtereinstellungen wurden übernommen. Du kannst sie vor dem Export noch anpassen.
            </p>

            {error && (
              <div className="animate-fade-in rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="export_vehicle_id" className="block text-sm font-medium text-foreground">
                Fahrzeug
              </label>
              <select
                id="export_vehicle_id"
                name="vehicle_id"
                defaultValue={initialVehicleId ?? ""}
                className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">Alle aktiven Fahrzeuge</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Kategorien</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="categories"
                      value={option.value}
                      defaultChecked={!initialCategory || initialCategory === option.value}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted">Ohne Auswahl werden alle Kategorien exportiert.</p>
            </fieldset>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="export_from_date" className="block text-sm font-medium text-foreground">
                  Von
                </label>
                <input
                  id="export_from_date"
                  name="from_date"
                  type="date"
                  defaultValue={initialStartDate ?? ""}
                  className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label htmlFor="export_to_date" className="block text-sm font-medium text-foreground">
                  Bis
                </label>
                <input
                  id="export_to_date"
                  name="to_date"
                  type="date"
                  defaultValue={initialEndDate ?? ""}
                  className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={exporting}
                className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong disabled:opacity-50"
              >
                {exporting ? "Wird exportiert..." : "CSV exportieren"}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
