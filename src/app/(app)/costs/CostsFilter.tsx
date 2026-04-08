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
}: {
  vehicles: Pick<Vehicle, "id" | "make" | "model">[];
  selectedVehicle?: string;
  selectedCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={selectedVehicle ?? ""}
        onChange={(e) => updateFilter("vehicle_id", e.target.value)}
        className="rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground"
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
        className="rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground"
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
