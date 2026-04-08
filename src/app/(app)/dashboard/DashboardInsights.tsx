"use client";

import { useMemo, useState } from "react";
import { getDictionary } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { Locale } from "@/lib/preferences";
import type { CostEntry, Reminder } from "@/types/domain";

type WidgetKey = "costTrend" | "categoryMix" | "reminderTimeline";

const STORAGE_KEY = "carman_dashboard_widgets";

const INITIAL_WIDGETS: Record<WidgetKey, boolean> = {
  costTrend: true,
  categoryMix: true,
  reminderTimeline: false,
};

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function DashboardInsights({
  costs,
  reminders,
  locale,
}: {
  costs: CostEntry[];
  reminders: Reminder[];
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

  const trendData = useMemo(() => {
    const now = new Date();
    const months: string[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(toMonthKey(d));
    }

    const totals = months.map((month) => {
      const total = costs
        .filter((entry) => entry.date.startsWith(month))
        .reduce((sum, entry) => sum + entry.amount, 0);
      return { month, total };
    });

    const max = Math.max(...totals.map((x) => x.total), 0);

    return totals.map((item) => ({
      ...item,
      height: max > 0 ? Math.max((item.total / max) * 100, 4) : 0,
    }));
  }, [costs]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of costs) {
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
  }, [costs]);

  const reminderTimeline = useMemo(() => {
    const now = new Date();
    const months: string[] = [];

    for (let i = 0; i < 6; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(toMonthKey(d));
    }

    return months.map((month) => {
      const count = reminders.filter(
        (r) => !r.is_completed && !!r.due_date && r.due_date.startsWith(month),
      ).length;

      return { month, count };
    });
  }, [reminders]);

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
        <button
          type="button"
          onClick={() => toggleWidget("reminderTimeline")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            enabledWidgets.reminderTimeline
              ? "border-brand/35 bg-brand/10 text-brand"
              : "border-border bg-card text-foreground/75 hover:bg-foreground/5"
          }`}
        >
          {t.dashboard.widgetReminderTimeline}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {enabledWidgets.costTrend && (
          <article className="surface rounded-xl p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t.dashboard.widgetCostsTrend}</h3>
            {trendData.every((item) => item.total === 0) ? (
              <p className="text-sm text-muted">{t.dashboard.noChartData}</p>
            ) : (
              <div className="grid grid-cols-6 items-end gap-2">
                {trendData.map((item) => (
                  <div key={item.month} className="space-y-1 text-center">
                    <div className="mx-auto h-24 w-full max-w-6 rounded bg-foreground/6 p-0.5">
                      <div
                        className="w-full rounded-sm bg-brand/80"
                        style={{ height: `${item.height}%`, marginTop: `${100 - item.height}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted">{item.month.slice(5)}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        )}

        {enabledWidgets.categoryMix && (
          <article className="surface rounded-xl p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t.dashboard.widgetCategoryMix}</h3>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted">{t.dashboard.noChartData}</p>
            ) : (
              <div className="space-y-2">
                {categoryData.map((row) => (
                  <div key={row.category}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="capitalize text-foreground/80">{row.category}</span>
                      <span className="text-muted">{formatCurrency(row.value, locale)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-foreground/8">
                      <div
                        className="h-2 rounded-full bg-brand/75"
                        style={{ width: `${row.width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        )}

        {enabledWidgets.reminderTimeline && (
          <article className="surface rounded-xl p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t.dashboard.widgetReminderTimeline}</h3>
            {reminderTimeline.every((item) => item.count === 0) ? (
              <p className="text-sm text-muted">{t.dashboard.noChartData}</p>
            ) : (
              <ul className="space-y-2">
                {reminderTimeline.map((item) => (
                  <li key={item.month} className="flex items-center justify-between rounded-md border border-border/60 px-2.5 py-1.5 text-xs">
                    <span className="text-foreground/80">{item.month}</span>
                    <span className="font-medium text-foreground">{item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )}
      </div>
    </section>
  );
}
