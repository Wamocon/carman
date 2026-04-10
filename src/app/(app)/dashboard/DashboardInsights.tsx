"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CostTrendExplorer } from "../../../components/CostTrendExplorer";
import { CategoryMixWidget } from "@/components/CategoryMixWidget";
import { ExpandIcon } from "@/components/Icons";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";
import type { CostEntry, Vehicle } from "@/types/domain";

type WidgetKey = "costTrend" | "categoryMix";

const STORAGE_KEY = "carman_dashboard_widgets";

const INITIAL_WIDGETS: Record<WidgetKey, boolean> = {
  costTrend: true,
  categoryMix: true,
};

export function DashboardInsights({
  costs,
  vehicles,
  locale,
}: {
  costs: CostEntry[];
  vehicles: Pick<Vehicle, "id" | "make" | "model">[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [enabledWidgets, setEnabledWidgets] = useState<Record<WidgetKey, boolean>>(() => {
    if (typeof window === "undefined") {
      return INITIAL_WIDGETS;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_WIDGETS;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<Record<WidgetKey, boolean>>;
      return { ...INITIAL_WIDGETS, ...parsed };
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return INITIAL_WIDGETS;
    }
  });

  const toggleWidget = (key: WidgetKey) => {
    setEnabledWidgets((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const [categoryMixVehicleIds, setCategoryMixVehicleIds] = useState<string[]>(
    vehicles.map((vehicle) => vehicle.id),
  );

  const categoryData = useMemo(() => {
    const selectedVehicleSet = new Set(categoryMixVehicleIds);
    const map = new Map<string, number>();
    for (const entry of costs) {
      if (!selectedVehicleSet.has(entry.vehicle_id)) {
        continue;
      }
      map.set(entry.category, (map.get(entry.category) ?? 0) + entry.amount);
    }

    const rows = Array.from(map.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const max = Math.max(...rows.map((x) => x.value), 0);

    return rows.map((row) => ({
      ...row,
      width: max > 0 ? Math.max((row.value / max) * 100, 6) : 0,
    }));
  }, [categoryMixVehicleIds, costs]);

  return (
    <section className="section-shell space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t.dashboard.widgetsTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.dashboard.widgetsCopy}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleWidget("costTrend")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            enabledWidgets.costTrend
              ? "border-brand/35 bg-brand/10 text-brand"
              : "border-border bg-card text-foreground/75 hover:bg-foreground/5"
          }`}
        >
          {t.dashboard.widgetCostsTrend}
        </button>
        <button
          type="button"
          onClick={() => toggleWidget("categoryMix")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            enabledWidgets.categoryMix
              ? "border-brand/35 bg-brand/10 text-brand"
              : "border-border bg-card text-foreground/75 hover:bg-foreground/5"
          }`}
        >
          {t.dashboard.widgetCategoryMix}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {enabledWidgets.costTrend ? (
          <article className="surface rounded-xl p-4 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{t.dashboard.widgetCostsTrend}</h3>
              <Link href="/dashboard/cost-trend" className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5" aria-label="Kostenverlauf vergrößern">
                <ExpandIcon className="h-4 w-4" />
              </Link>
            </div>
            <CostTrendExplorer costs={costs} vehicles={vehicles} locale={locale} expanded={false} />
          </article>
        ) : null}

        {enabledWidgets.categoryMix ? (
          <article className="surface rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{t.dashboard.widgetCategoryMix}</h3>
              <Link href="/dashboard/category-mix" className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5" aria-label="Kategorienmix vergrößern">
                <ExpandIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {vehicles.map((vehicle) => {
                const active = categoryMixVehicleIds.includes(vehicle.id);
                return (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() =>
                      setCategoryMixVehicleIds((prev) =>
                        prev.includes(vehicle.id)
                          ? prev.filter((entry) => entry !== vehicle.id)
                          : [...prev, vehicle.id],
                      )
                    }
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
                onClick={() => setCategoryMixVehicleIds(vehicles.map((vehicle) => vehicle.id))}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {locale === "de" ? "Alle Fahrzeuge" : "All vehicles"}
              </button>
            </div>
            <CategoryMixWidget rows={categoryData} locale={locale} categoryLabels={t.costCategories} />
          </article>
        ) : null}
      </div>
    </section>
  );
}

