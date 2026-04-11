"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CostCategory, CostEntry } from "@/types/domain";
import type { Locale } from "@/lib/preferences";

const CATEGORY_LABELS: Record<CostCategory, string> = {
  fuel: "Tanken",
  maintenance: "Wartung",
  repair: "Reparatur",
  insurance: "Versicherung",
  tax: "Steuer",
  leasing: "Leasing",
  financing: "Finanzierung",
  parking: "Parken",
  other: "Sonstiges",
  acquisition: "Anschaffung",
};

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

const STATUS_OPTIONS = [
  { value: "", label: "Alle Status" },
  { value: "open", label: "Offen" },
  { value: "paid", label: "Bezahlt" },
] as const;

export function VehicleCostFilter({
  allCosts,
  locale,
}: {
  allCosts: CostEntry[];
  locale: Locale;
}) {
  const [selectedCategories, setSelectedCategories] = useState<CostCategory[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    return allCosts.filter((entry) => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(entry.category as CostCategory)
      )
        return false;
      if (selectedStatus && entry.payment_status !== selectedStatus) return false;
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;
      return true;
    });
  }, [allCosts, selectedCategories, selectedStatus, startDate, endDate]);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    Boolean(selectedStatus) ||
    Boolean(startDate) ||
    Boolean(endDate);

  function toggleCategory(cat: CostCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function resetFilters() {
    setSelectedCategories([]);
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="space-y-3">
      {/* Filter toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowFilter((s) => !s)}
          className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
            hasActiveFilters
              ? "border-brand/35 bg-brand/10 text-brand"
              : "border-border bg-card text-foreground/75 hover:bg-foreground/5"
          }`}
        >
          {showFilter ? "Filter ausblenden" : "Filter anzeigen"}
          {hasActiveFilters ? ` · ${filtered.length} Einträge` : ""}
        </button>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-muted hover:text-foreground"
          >
            zurücksetzen
          </button>
        ) : null}
      </div>

      {/* Filter panel */}
      {showFilter ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-3">
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
              aria-label="Von"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
              aria-label="Bis"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((opt) => {
              const active = selectedCategories.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleCategory(opt.value)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? "border-brand/40 bg-brand/10 text-brand-strong"
                      : "border-border bg-card text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() =>
                setSelectedCategories(
                  selectedCategories.length === CATEGORY_OPTIONS.length
                    ? []
                    : CATEGORY_OPTIONS.map((o) => o.value),
                )
              }
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted hover:bg-foreground/5"
            >
              {selectedCategories.length === CATEGORY_OPTIONS.length ? "Keine" : "Alle"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Cost table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {hasActiveFilters
            ? "Keine Einträge für den gewählten Filter."
            : "Keine Einträge vorhanden."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-medium text-muted">Datum</th>
                <th className="pb-2 pr-4 font-medium text-muted">Kategorie</th>
                <th className="pb-2 pr-4 font-medium text-muted">Titel</th>
                <th className="pb-2 pr-4 font-medium text-muted">Servicetermin</th>
                <th className="pb-2 pr-4 font-medium text-muted">Status</th>
                <th className="pb-2 text-right font-medium text-muted">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((costEntry) => (
                <tr key={costEntry.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">{formatDate(costEntry.date, locale)}</td>
                  <td className="py-2 pr-4">
                    {costEntry.is_vehicle_sale
                      ? "Fahrzeugverkauf"
                      : (CATEGORY_LABELS[costEntry.category as CostCategory] ?? costEntry.category)}
                  </td>
                  <td className="py-2 pr-4">
                    <Link
                      href={`/costs/${costEntry.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {costEntry.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted">
                    {costEntry.reminder_id ? "Verknüpft" : "-"}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        costEntry.payment_status === "paid"
                          ? "bg-success/15 text-success"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {costEntry.payment_status === "paid" ? "Bezahlt" : "Offen"}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(costEntry.amount, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
