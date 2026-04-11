import type { Locale } from "@/lib/preferences";
import { formatCurrency } from "@/lib/utils";
import { COST_CATEGORY_ORDER } from "@/lib/cost-trend";
import type { CumulativeRow } from "@/lib/cost-trend";
import type { CostCategory } from "@/types/domain";

const CATEGORY_COLORS: Record<CostCategory, string> = {
  acquisition: "#6366f1",
  fuel: "#0ea5e9",
  maintenance: "#22c55e",
  repair: "#f97316",
  insurance: "#8b5cf6",
  tax: "#ef4444",
  leasing: "#f59e0b",
  financing: "#ec4899",
  parking: "#14b8a6",
  other: "#64748b",
};

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

function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  if (!year || !monthNumber) return month;
  return `${monthNumber}/${year.slice(-2)}`;
}

function niceAxisRange(rawMin: number, rawMax: number): { displayMin: number; displayMax: number; ticks: number[] } {
  const range = Math.max(rawMax - rawMin, 1);
  const roughStep = range / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  let step: number;
  if (normalized <= 1.5) step = magnitude;
  else if (normalized <= 3.5) step = 2 * magnitude;
  else if (normalized <= 7.5) step = 5 * magnitude;
  else step = 10 * magnitude;
  const displayMin = rawMin < 0 ? Math.floor(rawMin / step) * step : 0;
  const displayMax = Math.ceil(rawMax / step) * step;
  const ticks: number[] = [];
  for (let v = displayMin; v <= displayMax + step * 0.001; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return { displayMin, displayMax, ticks };
}

export function CostCumulativeChart({
  data,
  locale,
  visibleCategories,
  showTotal = true,
  className,
}: {
  data: CumulativeRow[];
  locale: Locale;
  visibleCategories?: CostCategory[];
  showTotal?: boolean;
  className?: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">Noch keine Daten vorhanden.</p>;
  }

  const width = 900;
  const height = 320;
  const paddingLeft = 72;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 46;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const activeCategories = visibleCategories && visibleCategories.length > 0
    ? visibleCategories
    : COST_CATEGORY_ORDER;

  const categoriesWithData = activeCategories.filter((cat) =>
    data.some((row) => (row.categoryCumulative[cat] ?? 0) !== 0),
  );

  const allValues = [
    ...(showTotal ? data.map((row) => row.cumulative) : []),
    ...categoriesWithData.flatMap((cat) => data.map((row) => row.categoryCumulative[cat] ?? 0)),
    0,
  ];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);

  const { displayMin, displayMax, ticks } = niceAxisRange(rawMin, rawMax);
  const displayRange = displayMax - displayMin;

  const xForIndex = (index: number) => {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const yForValue = (value: number) => {
    if (displayRange === 0) return paddingTop + plotHeight / 2;
    const ratio = (value - displayMin) / displayRange;
    return paddingTop + (1 - ratio) * plotHeight;
  };

  const zeroY = yForValue(0);
  const hasNegative = displayMin < 0;

  // Total cumulative line
  const totalPoints = data.map((row, i) => ({ x: xForIndex(i), y: yForValue(row.cumulative) }));
  const totalPath = totalPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = totalPath + ` L ${totalPoints[totalPoints.length - 1]!.x} ${zeroY} L ${totalPoints[0]!.x} ${zeroY} Z`;

  // Last value annotation
  const lastPoint = totalPoints[totalPoints.length - 1]!;
  const lastValue = data[data.length - 1]!.cumulative;

  // Sale markers
  const salePoints = data.map((row, i) => ({ row, i })).filter(({ row }) => row.hasSaleEntry);

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={className ?? "h-72 w-full rounded-xl border border-border/70 bg-card/80 p-2"}
        role="img"
        aria-label={locale === "de" ? "Kumulierter Kostenverlauf" : "Cumulative cost trend"}
      >
        {/* Grid + Y-axis labels */}
        {ticks.map((value) => {
          const y = yForValue(value);
          const isZero = value === 0;
          return (
            <g key={value}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke={isZero && hasNegative ? "#94a3b8" : "#cbd5e1"}
                strokeDasharray={isZero && hasNegative ? undefined : "4 4"}
                strokeWidth="1"
              />
              <text x={8} y={y + 4} fontSize="9.5" fill="#475569" textAnchor="start">
                {formatCurrency(value, locale)}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#94a3b8" strokeWidth="1" />
        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#94a3b8" strokeWidth="1" />

        {/* Area fill under total */}
        {showTotal ? <path d={areaPath} fill="#0f172a" fillOpacity="0.06" /> : null}

        {/* Per-category cumulative lines */}
        {categoriesWithData.map((cat) => {
          const points = data.map((row, i) => ({
            x: xForIndex(i),
            y: yForValue(row.categoryCumulative[cat] ?? 0),
          }));
          const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          return (
            <path
              key={cat}
              d={d}
              fill="none"
              stroke={CATEGORY_COLORS[cat]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Total cumulative line */}
        {showTotal ? (
          <path
            d={totalPath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Sale markers */}
        {showTotal ? salePoints.map(({ row, i }) => (
          <circle
            key={`sale-${row.month}`}
            cx={xForIndex(i)}
            cy={yForValue(row.cumulative)}
            r="5"
            fill="#dc2626"
            stroke="#fff"
            strokeWidth="1.5"
          />
        )) : null}

        {/* Last value annotation */}
        {showTotal ? (
          <>
            <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
            <text
              x={Math.min(lastPoint.x + 6, width - paddingRight - 4)}
              y={lastPoint.y - 8}
              fontSize="10"
              fill="#0f172a"
              textAnchor={lastPoint.x > width - paddingRight - 90 ? "end" : "start"}
              fontWeight="600"
            >
              {formatCurrency(lastValue, locale)}
            </text>
          </>
        ) : null}

        {/* X-axis labels */}
        {data.map((row, i) => {
          const showLabel = i % 3 === 0 || i === data.length - 1;
          if (!showLabel) return null;
          return (
            <text key={`${row.month}-lbl`} x={xForIndex(i) - 14} y={height - paddingBottom + 16} fontSize="10" fill="#475569">
              {monthLabel(row.month)}
            </text>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-3 text-xs text-foreground/85">
        {showTotal ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            {locale === "de" ? "Gesamt kumuliert" : "Total cumulative"}
          </span>
        ) : null}
        {showTotal && salePoints.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            {locale === "de" ? "Fahrzeugverkauf" : "Vehicle sale"}
          </span>
        )}
        {categoriesWithData.map((cat) => (
          <span key={cat} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
            {CATEGORY_LABELS[locale][cat]}
          </span>
        ))}
      </div>
    </div>
  );
}
