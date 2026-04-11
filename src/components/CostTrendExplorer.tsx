"use client";

import { useMemo, useState } from "react";
import { CostLinesChart } from "@/components/CostLinesChart";
import {
  buildTrendRows,
  COST_CATEGORY_ORDER,
  getCostDateBounds,
  monthKey,
  monthRange,
} from "@/lib/cost-trend";
import { formatCurrency } from "@/lib/utils";
import type { Locale } from "@/lib/preferences";
import type { CostCategory, CostEntry, Vehicle } from "@/types/domain";

const CATEGORY_LABELS: Record<Locale, Record<CostCategory, string>> = {
  de: {
    acquisition: "Anschaffung",
    fuel: "Tanken",
    maintenance: "Wartung",
    repair: "Reparatur",
    insurance: "Versicherung",
    tax: "Steuer",
    leasing: "Leasing",
    financing: "Finanzierung",
    parking: "Parken",
    other: "Sonstiges",
  },
  en: {
    acquisition: "Acquisition",
    fuel: "Fuel",
    maintenance: "Maintenance",
    repair: "Repair",
    insurance: "Insurance",
    tax: "Tax",
    leasing: "Leasing",
    financing: "Financing",
    parking: "Parking",
    other: "Other",
  },
};

export function CostTrendExplorer({
  costs,
  vehicles,
  locale,
  expanded,
}: {
  costs: CostEntry[];
  vehicles: Pick<Vehicle, "id" | "make" | "model">[];
  locale: Locale;
  expanded: boolean;
}) {
  const currentMonth = monthKey(new Date());
  const [selectedCategories, setSelectedCategories] = useState<CostCategory[]>(COST_CATEGORY_ORDER);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(vehicles.map((vehicle) => vehicle.id));
  const [manualRange, setManualRange] = useState<{ startMonth: string; endMonth: string } | null>(null);
  const [showTotal, setShowTotal] = useState(true);
  const [showAverage, setShowAverage] = useState(true);

  const filteredEntries = useMemo(() => {
    const selectedCategorySet = new Set(selectedCategories);
    const selectedVehicleSet = new Set(selectedVehicleIds);

    return costs.filter(
      (entry) => selectedCategorySet.has(entry.category) && selectedVehicleSet.has(entry.vehicle_id),
    );
  }, [costs, selectedCategories, selectedVehicleIds]);

  // Only paid entries drive the time axis and trend calculation
  const paidFilteredEntries = useMemo(
    () => filteredEntries.filter((entry) => entry.payment_status === "paid"),
    [filteredEntries],
  );

  const derivedRange = useMemo(() => {
    return getCostDateBounds(paidFilteredEntries) ?? {
      startMonth: currentMonth,
      endMonth: currentMonth,
    };
  }, [currentMonth, paidFilteredEntries]);

  const resolvedManualRange =
    manualRange &&
    !(manualRange.startMonth > derivedRange.endMonth || manualRange.endMonth < derivedRange.startMonth)
      ? manualRange
      : derivedRange;

  const startMonth = expanded
    ? resolvedManualRange.startMonth
    : derivedRange.startMonth;
  const endMonth = expanded ? resolvedManualRange.endMonth : derivedRange.endMonth;

  const months = useMemo(() => monthRange(startMonth, endMonth), [endMonth, startMonth]);
  const trendData = useMemo(() => buildTrendRows(paidFilteredEntries, months), [paidFilteredEntries, months]);

  const dynamicTotal = trendData.reduce((sum, row) => sum + row.total, 0);
  const dynamicAverage = trendData.length > 0 ? dynamicTotal / trendData.length : 0;

  const toggleCategory = (category: CostCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((entry) => entry !== category)
        : [...prev, category],
    );
  };

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((entry) => entry !== vehicleId)
        : [...prev, vehicleId],
    );
  };

  const allCatsSelected = selectedCategories.length === COST_CATEGORY_ORDER.length;
  const allVehsSelected = selectedVehicleIds.length === vehicles.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {COST_CATEGORY_ORDER.map((category) => {
            const active = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? "border-brand/40 bg-brand/10 text-brand-strong"
                    : "border-border bg-card text-foreground/70 hover:bg-foreground/5"
                }`}
              >
                {CATEGORY_LABELS[locale][category]}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedCategories(allCatsSelected ? [] : [...COST_CATEGORY_ORDER])}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-foreground/5"
          >
            {allCatsSelected
              ? locale === "de" ? "Keine" : "None"
              : locale === "de" ? "Alle" : "All"}
          </button>

          <span className="h-5 w-px bg-border/60 self-center" />

          <button
            type="button"
            onClick={() => setShowTotal((v) => !v)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              showTotal
                ? "border-slate-400/40 bg-slate-900/10 text-slate-900 dark:text-foreground"
                : "border-border bg-card text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            {locale === "de" ? "Gesamt" : "Total"}
          </button>

          <button
            type="button"
            onClick={() => setShowAverage((v) => !v)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              showAverage
                ? "border-red-400/40 bg-red-500/10 text-red-700"
                : "border-border bg-card text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            {locale === "de" ? "Durchschnitt" : "Average"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-3 rounded-xl border border-border/70 bg-card/60 p-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted">{locale === "de" ? "Zeitraum" : "Time range"}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="month"
                value={startMonth}
                onChange={(event) =>
                  setManualRange((prev) => ({
                    startMonth: event.target.value,
                    endMonth: prev?.endMonth ?? endMonth,
                  }))
                }
                className="rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground"
              />
              <input
                type="month"
                value={endMonth}
                onChange={(event) =>
                  setManualRange((prev) => ({
                    startMonth: prev?.startMonth ?? startMonth,
                    endMonth: event.target.value,
                  }))
                }
                className="rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted">{locale === "de" ? "Fahrzeuge" : "Vehicles"}</p>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((vehicle) => {
                const active = selectedVehicleIds.includes(vehicle.id);
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => toggleVehicle(vehicle.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      active
                        ? "border-brand/40 bg-brand/10 text-brand-strong"
                        : "border-border bg-card text-foreground/70"
                    }`}
                  >
                    {vehicle.make} {vehicle.model}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setSelectedVehicleIds(allVehsSelected ? [] : vehicles.map((v) => v.id))
                }
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {allVehsSelected
                  ? locale === "de" ? "Keine" : "None"
                  : locale === "de" ? "Alle" : "All"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/60 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">{locale === "de" ? "Gesamtkosten (Auswahl)" : "Total costs (selection)"}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{formatCurrency(dynamicTotal, locale)}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">{locale === "de" ? "Durchschnitt pro Monat" : "Average per month"}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{formatCurrency(dynamicAverage, locale)}</p>
        </div>
      </div>

      {trendData.length === 0 ? (
        <p className="text-sm text-muted">{locale === "de" ? "Bitte mindestens einen passenden Eintrag wählen." : "Please choose at least one matching entry."}</p>
      ) : (
        <CostLinesChart
          data={trendData}
          locale={locale}
          visibleCategories={selectedCategories}
          showTotal={showTotal}
          showAverage={showAverage}
          className={expanded ? "h-[28rem] w-full rounded-xl border border-border/70 bg-card/80 p-2" : undefined}
        />
      )}
    </div>
  );
}
