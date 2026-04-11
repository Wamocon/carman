"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CostCumulativeChart } from "@/components/CostCumulativeChart";
import { ExpandIcon } from "@/components/Icons";
import {
  buildCumulativeTrend,
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

export function CostCumulativeExplorer({
  costs,
  vehicles,
  locale,
  expanded,
  expandHref,
}: {
  costs: CostEntry[];
  vehicles?: Pick<Vehicle, "id" | "make" | "model">[];
  locale: Locale;
  expanded: boolean;
  expandHref?: string;
}) {
  const currentMonth = monthKey(new Date());
  const allVehicleIds = useMemo(() => vehicles?.map((v) => v.id) ?? [], [vehicles]);

  const [selectedCategories, setSelectedCategories] = useState<CostCategory[]>(COST_CATEGORY_ORDER);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(allVehicleIds);
  const [manualRange, setManualRange] = useState<{ startMonth: string; endMonth: string } | null>(null);
  const [showTotal, setShowTotal] = useState(true);

  const paidFilteredCosts = useMemo(() => {
    const catSet = new Set(selectedCategories);
    const vehSet = vehicles ? new Set(selectedVehicleIds) : null;
    return costs.filter(
      (entry) =>
        entry.payment_status === "paid" &&
        catSet.has(entry.category) &&
        (vehSet === null || vehSet.has(entry.vehicle_id)),
    );
  }, [costs, selectedCategories, selectedVehicleIds, vehicles]);

  const derivedRange = useMemo(() => {
    return getCostDateBounds(paidFilteredCosts) ?? { startMonth: currentMonth, endMonth: currentMonth };
  }, [paidFilteredCosts, currentMonth]);

  const resolvedManualRange =
    manualRange &&
    !(manualRange.startMonth > derivedRange.endMonth || manualRange.endMonth < derivedRange.startMonth)
      ? manualRange
      : derivedRange;

  const startMonth = expanded ? resolvedManualRange.startMonth : derivedRange.startMonth;
  const endMonth = expanded ? resolvedManualRange.endMonth : derivedRange.endMonth;

  const months = useMemo(() => monthRange(startMonth, endMonth), [startMonth, endMonth]);
  const cumulativeData = useMemo(
    () => buildCumulativeTrend(paidFilteredCosts, months),
    [paidFilteredCosts, months],
  );

  const finalCumulative = cumulativeData[cumulativeData.length - 1]?.cumulative ?? 0;
  const saleRevenue = paidFilteredCosts
    .filter((e) => e.is_vehicle_sale)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  const allCatsSelected = selectedCategories.length === COST_CATEGORY_ORDER.length;
  const allVehsSelected = !vehicles || selectedVehicleIds.length === vehicles.length;

  const toggleCategory = (cat: CostCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <div className="space-y-4">
      {/* Header row with expand button */}
      {expandHref ? (
        <div className="flex items-center justify-between gap-3">
          <span />
          <Link
            href={expandHref}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5"
            aria-label={locale === "de" ? "Kumulierten Kostenverlauf vergrößern" : "Expand cumulative chart"}
          >
            <ExpandIcon className="h-4 w-4" />
          </Link>
        </div>
      ) : null}

      {/* Category toggles */}
      <div className="flex flex-wrap gap-2">
        {COST_CATEGORY_ORDER.map((cat) => {
          const active = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? "border-brand/40 bg-brand/10 text-brand-strong"
                  : "border-border bg-card text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {CATEGORY_LABELS[locale][cat]}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() =>
            setSelectedCategories(allCatsSelected ? [] : [...COST_CATEGORY_ORDER])
          }
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
      </div>

      {/* Expanded controls: time range + vehicle filter */}
      {expanded ? (
        <div className="grid gap-3 rounded-xl border border-border/70 bg-card/60 p-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted">
              {locale === "de" ? "Zeitraum" : "Time range"}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="month"
                value={startMonth}
                onChange={(e) =>
                  setManualRange((prev) => ({
                    startMonth: e.target.value,
                    endMonth: prev?.endMonth ?? endMonth,
                  }))
                }
                className="rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground"
              />
              <input
                type="month"
                value={endMonth}
                onChange={(e) =>
                  setManualRange((prev) => ({
                    startMonth: prev?.startMonth ?? startMonth,
                    endMonth: e.target.value,
                  }))
                }
                className="rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          {vehicles && vehicles.length > 0 ? (
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted">
                {locale === "de" ? "Fahrzeuge" : "Vehicles"}
              </p>
              <div className="flex flex-wrap gap-2">
                {vehicles.map((v) => {
                  const active = selectedVehicleIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        setSelectedVehicleIds((prev) =>
                          prev.includes(v.id)
                            ? prev.filter((id) => id !== v.id)
                            : [...prev, v.id],
                        )
                      }
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        active
                          ? "border-brand/40 bg-brand/10 text-brand-strong"
                          : "border-border bg-card text-foreground/70"
                      }`}
                    >
                      {v.make} {v.model}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedVehicleIds(allVehsSelected ? [] : allVehicleIds)
                  }
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {allVehsSelected
                    ? locale === "de" ? "Keine" : "None"
                    : locale === "de" ? "Alle" : "All"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* KPI tiles */}
      <div className={`grid gap-3 ${saleRevenue > 0 ? "sm:grid-cols-2" : ""}`}>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {locale === "de" ? "Kumuliert gesamt" : "Total cumulative"}
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCurrency(finalCumulative, locale)}
          </p>
        </div>
        {saleRevenue > 0 ? (
          <div className="rounded-xl border border-border/70 bg-card/60 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              {locale === "de" ? "Verkaufserlöse (inkl.)" : "Sale proceeds (incl.)"}
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {formatCurrency(saleRevenue, locale)}
            </p>
          </div>
        ) : null}
      </div>

      {cumulativeData.length === 0 ? (
        <p className="text-sm text-muted">
          {locale === "de"
            ? "Bitte mindestens einen passenden Eintrag wählen."
            : "Please select at least one matching entry."}
        </p>
      ) : (
        <CostCumulativeChart
          data={cumulativeData}
          locale={locale}
          visibleCategories={selectedCategories}
          showTotal={showTotal}
          className={expanded ? "h-[28rem] w-full rounded-xl border border-border/70 bg-card/80 p-2" : undefined}
        />
      )}
    </div>
  );
}
