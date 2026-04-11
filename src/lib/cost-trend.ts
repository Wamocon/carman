import type { CostCategory, CostEntry } from "@/types/domain";

export const COST_CATEGORY_ORDER: CostCategory[] = [
  "acquisition",
  "fuel",
  "maintenance",
  "repair",
  "insurance",
  "tax",
  "leasing",
  "financing",
  "parking",
  "other",
];

export interface TrendRow {
  month: string;
  total: number;
  average: number;
  categories: Partial<Record<CostCategory, number>>;
}

export interface CumulativeRow {
  month: string;
  cumulative: number;
  monthDelta: number;
  hasSaleEntry: boolean;
  categoryCumulative: Partial<Record<CostCategory, number>>;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function dateStringToMonthKey(date: string): string {
  return date.slice(0, 7);
}

export function monthRange(start: string, end: string): string[] {
  if (!start || !end || start > end) {
    return [];
  }

  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);

  if (!startYear || !startMonth || !endYear || !endMonth) {
    return [];
  }

  const result: string[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    result.push(`${currentYear}-${String(currentMonth).padStart(2, "0")}`);
    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
  }

  return result;
}

export function getCostDateBounds(costs: CostEntry[]): { startMonth: string; endMonth: string } | null {
  if (costs.length === 0) {
    return null;
  }

  const sortedMonths = costs
    .map((entry) => dateStringToMonthKey(entry.date))
    .sort((left, right) => left.localeCompare(right));

  return {
    startMonth: sortedMonths[0],
    endMonth: sortedMonths[sortedMonths.length - 1],
  };
}

export function buildTrendRows(costs: CostEntry[], months: string[]): TrendRow[] {
  const rows = months.map((month) => {
    const monthEntries = costs.filter((entry) => entry.date.startsWith(month));
    const categories: Partial<Record<CostCategory, number>> = {};

    for (const category of COST_CATEGORY_ORDER) {
      categories[category] = monthEntries
        .filter((entry) => entry.category === category)
        .reduce((sum, entry) => sum + entry.amount, 0);
    }

    return {
      month,
      total: monthEntries.reduce((sum, entry) => sum + entry.amount, 0),
      categories,
    };
  });

  // Rolling average: each month shows cumulative average up to that point
  let runningTotal = 0;
  return rows.map((row, index) => {
    runningTotal += row.total;
    return {
      ...row,
      average: runningTotal / (index + 1),
    };
  });
}

/**
 * Builds a cumulative running-total series from cost entries.
 * Includes all entry types (acquisition, running costs, sale proceeds as negative).
 * The cumulative value increases with costs and decreases with sale proceeds.
 */
export function buildCumulativeTrend(costs: CostEntry[], months: string[]): CumulativeRow[] {
  let running = 0;
  const categoryRunning: Partial<Record<CostCategory, number>> = {};

  return months.map((month) => {
    const monthEntries = costs.filter((entry) => entry.date.startsWith(month));
    const monthDelta = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const hasSaleEntry = monthEntries.some((entry) => entry.is_vehicle_sale);
    running += monthDelta;

    for (const entry of monthEntries) {
      categoryRunning[entry.category] = (categoryRunning[entry.category] ?? 0) + entry.amount;
    }

    return {
      month,
      cumulative: running,
      monthDelta,
      hasSaleEntry,
      categoryCumulative: { ...categoryRunning },
    };
  });
}
