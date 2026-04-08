"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Vehicle } from "@/types/domain";

const CATEGORY_OPTIONS = [
  { value: "", label: "Alle Kategorien" },
  { value: "fuel", label: "Tanken" },
  { value: "maintenance", label: "Wartung" },
  { value: "repair", label: "Reparatur" },
  { value: "insurance", label: "Versicherung" },
  { value: "tax", label: "Steuer" },
  { value: "leasing", label: "Leasing" },
  { value: "parking", label: "Parken" },
  { value: "other", label: "Sonstiges" },
] as const;

export function CostsFilter({
  vehicles,
  selectedVehicle,
  selectedCategory,
  selectedStartDate,
  selectedEndDate,
}: {
  vehicles: Pick<Vehicle, "id" | "make" | "model">[];
  selectedVehicle?: string;
  selectedCategory?: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasActiveFilters =
    Boolean(selectedVehicle) ||
    Boolean(selectedCategory) ||
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

  function resetFilters() {
    router.push("/costs");
  }

  return (
    <div className="section-shell flex flex-wrap items-center gap-3 p-4">
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
        value={selectedCategory ?? ""}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
      >
        {CATEGORY_OPTIONS.map((opt) => (
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
  );
}


