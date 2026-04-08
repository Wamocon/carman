import Link from "next/link";
import { ReminderTimelineWidget } from "@/components/ReminderTimelineWidget";
import { monthKey } from "@/lib/cost-trend";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Servicetermin-Zeitachse groß — CarMan",
};

export default async function DashboardReminderTimelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: reminders } = await supabase
    .from("reminders")
    .select("due_date")
    .eq("user_id", user.id)
    .eq("is_completed", false);

  const now = new Date();
  const months: string[] = [];
  for (let index = 0; index < 12; index += 1) {
    months.push(monthKey(new Date(now.getFullYear(), now.getMonth() + index, 1)));
  }

  const items = months.map((month) => ({
    month,
    count: (reminders ?? []).filter((reminder) => reminder.due_date?.startsWith(month)).length,
  }));

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Analyse</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Servicetermin-Zeitachse groß</h1>
            <p className="mt-2 text-sm help-copy">Die große Ansicht fasst anstehende Servicetermine über die nächsten zwölf Monate zusammen.</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5">
            Zurück zum Dashboard
          </Link>
        </div>
      </section>

      <section className="section-shell p-5 sm:p-6">
        <ReminderTimelineWidget items={items} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" />
      </section>
    </div>
  );
}
