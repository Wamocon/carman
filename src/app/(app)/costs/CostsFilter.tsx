"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Vehicle } from "@/types/domain";

const CATEGORY_OPTIONS = [
  { value: "fuel", label: "Tanken" },
  { value: "maintenance", label: "Wartung" },
  { value: "repair", label: "Reparatur" },
  { value: "insurance", label: "Versicherung" },
  { value: "tax", label: "Steuer" },
  { value: "leasing", label: "Leasing" },
  { value: "financing", label: "Finanzierung" },
  { value: "parking", label: "Parken" },
  { value: "other", label: "Sonstiges" },
  { value: "acquisition", label: "Anschaffung" },
] as const;

const STATUS_OPTIONS = [
  { value: "", label: "Alle Status" },
  { value: "open", label: "Offen" },
  { value: "paid", label: "Bezahlt" },
] as const;

export function CostsFilter({
  vehicles,
  selectedVehicle,
  selectedCategories,
  selectedStatus,
  selectedStartDate,
  selectedEndDate,
}: {
  vehicles: Pick<Vehicle, "id" | "make" | "model">[];
  selectedVehicle?: string;
  selectedCategories: string[];
  selectedStatus?: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasActiveFilters =
    Boolean(selectedVehicle) ||
    selectedCategories.length > 0 ||
    Boolean(selectedStatus) ||
    Boolean(selectedStartDate) ||
    Boolean(selectedEndDate);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/costs?${params.toString()}`);
  }

  function toggleCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = (params.get("categories") ?? "").split(",").filter(Boolean);
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    if (next.length > 0) {
      params.set("categories", next.join(","));
    } else {
      params.delete("categories");
    }
    params.delete("page");
    router.push(`/costs?${params.toString()}`);
  }

  function resetFilters() {
    router.push("/costs");
  }

  return (
    <div className="section-shell space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">Filter</p>

        <select
          value={selectedVehicle ?? ""}
          onChange={(e) => updateFilter("vehicle_id", e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="">Alle Fahrzeuge</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.model}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus ?? ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={selectedStartDate ?? ""}
          onChange={(e) => updateFilter("start_date", e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          aria-label="Startdatum"
        />

        <input
          type="date"
          value={selectedEndDate ?? ""}
          onChange={(e) => updateFilter("end_date", e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          aria-label="Enddatum"
        />

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
          >
            Filter zurücksetzen
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs text-muted">
          Kategorien{" "}
          <span className="text-foreground/50">(Mehrfachauswahl)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((opt) => {
            const active = selectedCategories.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleCategory(opt.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-brand/40 bg-brand/10 text-brand-strong"
                    : "border-border bg-card text-foreground/75 hover:bg-foreground/5"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          {selectedCategories.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("categories");
                params.delete("page");
                router.push(`/costs?${params.toString()}`);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted hover:bg-foreground/5"
            >
              Alle
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
