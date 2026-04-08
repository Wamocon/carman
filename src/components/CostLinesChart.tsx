import type { Locale } from "@/lib/preferences";
import { formatCurrency } from "@/lib/utils";
import type { CostCategory } from "@/types/domain";

type ChartPoint = {
  month: string;
  total: number;
  average: number;
  categories: Partial<Record<CostCategory, number>>;
};

const CATEGORY_ORDER: CostCategory[] = [
  "fuel",
  "maintenance",
  "repair",
  "insurance",
  "tax",
  "leasing",
  "parking",
  "other",
];

const CATEGORY_COLORS: Record<CostCategory, string> = {
  fuel: "#0ea5e9",
  maintenance: "#22c55e",
  repair: "#f97316",
  insurance: "#8b5cf6",
  tax: "#ef4444",
  leasing: "#f59e0b",
  parking: "#14b8a6",
  other: "#64748b",
};

const CATEGORY_LABELS: Record<Locale, Record<CostCategory, string>> = {
  de: {
    fuel: "Tanken",
    maintenance: "Wartung",
    repair: "Reparatur",
    insurance: "Versicherung",
    tax: "Steuer",
    leasing: "Leasing",
    parking: "Parken",
    other: "Sonstiges",
  },
  en: {
    fuel: "Fuel",
    maintenance: "Maintenance",
    repair: "Repair",
    insurance: "Insurance",
    tax: "Tax",
    leasing: "Leasing",
    parking: "Parking",
    other: "Other",
  },
};

function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  if (!year || !monthNumber) return month;
  return `${monthNumber}/${year.slice(-2)}`;
}

function pointsToPath(points: Array<{ x: number; y: number }>): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function CostLinesChart({
  data,
  locale,
  visibleCategories,
  className,
}: {
  data: ChartPoint[];
  locale: Locale;
  visibleCategories?: CostCategory[];
  className?: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">Noch keine Daten vorhanden.</p>;
  }

  const width = 900;
  const height = 320;
  const paddingLeft = 56;
  const paddingRight = 18;
  const paddingTop = 18;
  const paddingBottom = 46;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(
    ...data.map((entry) => entry.total),
    ...data.flatMap((entry) => CATEGORY_ORDER.map((category) => entry.categories[category] ?? 0)),
    ...data.map((entry) => entry.average),
    0,
  );

  if (maxValue <= 0) {
    return <p className="text-sm text-muted">Noch zu wenig Kosten für einen Verlauf.</p>;
  }

  const xForIndex = (index: number) => {
    if (data.length <= 1) {
      return paddingLeft + plotWidth / 2;
    }

    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const yForValue = (value: number) => {
    const ratio = Math.max(0, Math.min(1, value / maxValue));
    return paddingTop + (1 - ratio) * plotHeight;
  };

  const totalLine = data.map((entry, index) => ({
    x: xForIndex(index),
    y: yForValue(entry.total),
  }));

  const averageLine = data.map((entry, index) => ({
    x: xForIndex(index),
    y: yForValue(entry.average),
  }));

  const sourceCategories = visibleCategories && visibleCategories.length > 0
    ? visibleCategories
    : CATEGORY_ORDER;

  const categoriesWithValues = sourceCategories.filter((category) =>
    data.some((entry) => (entry.categories[category] ?? 0) > 0),
  );

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={className ?? "h-72 w-full rounded-xl border border-border/70 bg-card/80 p-2"}
        role="img"
        aria-label={locale === "de" ? "Monatlicher Kostenverlauf" : "Monthly cost trend"}
      >
        <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#94a3b8" strokeWidth="1" />
        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#94a3b8" strokeWidth="1" />

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = maxValue * ratio;
          const y = yForValue(value);
          return (
            <g key={ratio}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" />
              <text x={8} y={y + 4} fontSize="10" fill="#475569">{formatCurrency(value, locale)}</text>
            </g>
          );
        })}

        {categoriesWithValues.map((category) => {
          const categoryPoints = data.map((entry, index) => ({
            x: xForIndex(index),
            y: yForValue(entry.categories[category] ?? 0),
          }));

          return (
            <path
              key={category}
              d={pointsToPath(categoryPoints)}
              fill="none"
              stroke={CATEGORY_COLORS[category]}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          );
        })}

        <path
          d={pointsToPath(totalLine)}
          fill="none"
          stroke="#0f172a"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        <path
          d={pointsToPath(averageLine)}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2.7"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />

        {data.map((entry, index) => {
          const x = xForIndex(index);
          const y = height - paddingBottom + 16;
          const showLabel = index % 3 === 0 || index === data.length - 1;

          if (!showLabel) {
            return null;
          }

          return (
            <text key={`${entry.month}-label`} x={x - 14} y={y} fontSize="10" fill="#475569">
              {monthLabel(entry.month)}
            </text>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-3 text-xs text-foreground/85">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          {locale === "de" ? "Gesamtkosten" : "Total costs"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
          <span className="h-0.5 w-3 bg-red-600" />
          {locale === "de" ? "Durchschnitt" : "Average"}
        </span>
        {categoriesWithValues.map((category) => (
          <span key={category} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
            {CATEGORY_LABELS[locale][category]}
          </span>
        ))}
      </div>
    </div>
  );
}


