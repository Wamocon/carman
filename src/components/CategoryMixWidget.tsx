import { formatCurrency } from "@/lib/utils";
import type { Locale } from "@/lib/preferences";

export interface CategoryMixRow {
  category: string;
  value: number;
  width: number;
}

export function CategoryMixWidget({
  rows,
  locale,
  className,
}: {
  rows: CategoryMixRow[];
  locale: Locale;
  className?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Noch zu wenig Daten für eine Auswertung.</p>;
  }

  return (
    <div className={className ?? "space-y-2"}>
      {rows.map((row) => (
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
  );
}
