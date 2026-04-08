export interface ReminderTimelineRow {
  month: string;
  count: number;
}

export function ReminderTimelineWidget({
  items,
  className,
}: {
  items: ReminderTimelineRow[];
  className?: string;
}) {
  if (items.every((item) => item.count === 0)) {
    return <p className="text-sm text-muted">Noch zu wenig Daten für eine Auswertung.</p>;
  }

  return (
    <ul className={className ?? "space-y-2"}>
      {items.map((item) => (
        <li key={item.month} className="flex items-center justify-between rounded-md border border-border/60 px-2.5 py-1.5 text-xs">
          <span className="text-foreground/80">{item.month}</span>
          <span className="font-medium text-foreground">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
