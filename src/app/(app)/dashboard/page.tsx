import Link from "next/link";
import { PhotoIcon } from "@/components/Icons";
import { DashboardInsights } from "./DashboardInsights";
import { getDictionary } from "@/lib/i18n";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { CostEntry, Reminder, Vehicle, VehicleImage } from "@/types/domain";

export const metadata = {
  title: "Dashboard — CarMan",
};

export default async function DashboardPage() {
  const locale = await getLocaleFromCookies();
  const t = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: vehicles },
    { data: costEntries },
    { data: reminders },
    { data: primaryImages },
  ] = await Promise.all([
    supabase.from("vehicles").select("*").eq("user_id", user.id),
    supabase.from("cost_entries").select("*").eq("user_id", user.id),
    supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_completed", false),
    supabase
      .from("vehicle_images")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_primary", true),
  ]);

  const allVehicles = (vehicles ?? []) as Vehicle[];
  const allCosts = (costEntries ?? []) as CostEntry[];
  const allReminders = (reminders ?? []) as Reminder[];
  const imageRecords = (primaryImages ?? []) as VehicleImage[];

  const signedPrimaryImages = await Promise.all(
    imageRecords.map(async (image) => {
      const { data } = await supabase.storage
        .from("vehicle-images")
        .createSignedUrl(image.storage_path, 60 * 30);

      return [image.vehicle_id, data?.signedUrl ?? null] as const;
    }),
  );

  const primaryImageMap = Object.fromEntries(signedPrimaryImages);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const costsThisMonth = allCosts
    .filter((c) => c.date.startsWith(thisMonth))
    .reduce((sum, c) => sum + c.amount, 0);

  const costsLastMonth = allCosts
    .filter((c) => c.date.startsWith(lastMonth))
    .reduce((sum, c) => sum + c.amount, 0);

  const today = now.toISOString().split("T")[0];
  const upcomingReminders = allReminders.filter(
    (r) =>
      !r.is_completed &&
      ((r.due_date && r.due_date >= today) || r.due_mileage !== null),
  );

  const focusVehicle =
    allVehicles
      .map((vehicle) => {
        const vehicleCosts = allCosts
          .filter((entry) => entry.vehicle_id === vehicle.id)
          .sort((a, b) => b.date.localeCompare(a.date));
        const vehicleReminders = upcomingReminders.filter(
          (entry) => entry.vehicle_id === vehicle.id,
        );

        return {
          vehicle,
          latestCost: vehicleCosts[0] ?? null,
          openReminderCount: vehicleReminders.length,
        };
      })
      .sort((a, b) => {
        if (a.openReminderCount !== b.openReminderCount) {
          return b.openReminderCount - a.openReminderCount;
        }

        if (a.latestCost?.date && b.latestCost?.date) {
          return b.latestCost.date.localeCompare(a.latestCost.date);
        }

        if (a.latestCost?.date) return -1;
        if (b.latestCost?.date) return 1;
        return 0;
      })[0] ?? null;

  const nextReminderForFocus = focusVehicle
    ? upcomingReminders
        .filter((entry) => entry.vehicle_id === focusVehicle.vehicle.id)
        .sort((a, b) => {
          const aDate = a.due_date ?? "9999-12-31";
          const bDate = b.due_date ?? "9999-12-31";
          if (aDate !== bDate) return aDate.localeCompare(bDate);

          const aMileage = a.due_mileage ?? Number.MAX_SAFE_INTEGER;
          const bMileage = b.due_mileage ?? Number.MAX_SAFE_INTEGER;
          return aMileage - bMileage;
        })[0] ?? null
    : null;

  const focusVehicleImageUrl = focusVehicle
    ? primaryImageMap[focusVehicle.vehicle.id] ?? undefined
    : undefined;

  const connectionScore = (() => {
    if (!focusVehicle) return 0;

    let score = 15;
    const vehicle = focusVehicle.vehicle;

    if ((vehicle.purchase_price ?? 0) > 0) score += 25;
    if (focusVehicle.openReminderCount > 0) score += 20;
    if (vehicle.current_mileage > 0) score += 10;

    if (focusVehicle.latestCost?.date) {
      const msSinceActivity =
        new Date(today).getTime() - new Date(focusVehicle.latestCost.date).getTime();
      const daysSinceActivity = msSinceActivity / (1000 * 60 * 60 * 24);
      if (daysSinceActivity <= 90) {
        score += 30;
      }
    }

    return Math.min(score, 100);
  })();

  function getVehicleStats(vehicleId: string) {
    const vCosts = allCosts.filter((c) => c.vehicle_id === vehicleId);
    const totalCosts = vCosts.reduce((sum, c) => sum + c.amount, 0);

    const fuelEntries = vCosts.filter(
      (c) => c.category === "fuel" && c.liters && c.mileage,
    );

    let avgConsumption: number | null = null;
    const vehicle = allVehicles.find((v) => v.id === vehicleId);
    const hasFuelConsumption =
      vehicle &&
      (vehicle.fuel_type === "petrol" ||
        vehicle.fuel_type === "diesel" ||
        vehicle.fuel_type === "lpg" ||
        vehicle.fuel_type === "cng" ||
        vehicle.fuel_type === "hybrid");

    if (hasFuelConsumption && fuelEntries.length >= 2) {
      const sorted = [...fuelEntries].sort(
        (a, b) => (a.mileage ?? 0) - (b.mileage ?? 0),
      );
      const totalLiters = sorted
        .slice(1)
        .reduce((sum, e) => sum + (e.liters ?? 0), 0);
      const totalDistance =
        (sorted[sorted.length - 1].mileage ?? 0) - (sorted[0].mileage ?? 0);
      if (totalDistance > 0) {
        avgConsumption = (totalLiters / totalDistance) * 100;
      }
    }

    return { totalCosts, avgConsumption };
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="section-shell overflow-hidden p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{t.dashboard.eyebrow}</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground sm:text-4xl">{t.dashboard.title}</h1>
            <p className="mt-2 max-w-2xl text-sm help-copy sm:text-base">
              {t.dashboard.copy}
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3 lg:grid-cols-1">
            <Link href="/costs/new" className="rounded-xl bg-brand px-4 py-2.5 text-center font-medium text-white hover:bg-brand-strong">
              {t.dashboard.addCost}
            </Link>
            <Link href="/reminders/new" className="rounded-xl border border-border bg-card px-4 py-2.5 text-center font-medium hover:bg-foreground/5">
              {t.dashboard.addReminder}
            </Link>
            <Link href="/vehicles/new" className="rounded-xl border border-border bg-card px-4 py-2.5 text-center font-medium hover:bg-foreground/5">
              {t.dashboard.addVehicle}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">{t.common.month}</p>
          <p className="mt-2 text-sm text-muted">{t.dashboard.currentCosts}</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(costsThisMonth, locale)}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">{t.common.compare}</p>
          <p className="mt-2 text-sm text-muted">{t.dashboard.previousCosts}</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(costsLastMonth, locale)}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">{t.common.inventory}</p>
          <p className="mt-2 text-sm text-muted">{t.dashboard.vehicleCount}</p>
          <p className="mt-1 text-2xl font-semibold">{allVehicles.length}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">{t.common.todos}</p>
          <p className="mt-2 text-sm text-muted">{t.dashboard.openReminders}</p>
          <p className="mt-1 text-2xl font-semibold">{upcomingReminders.length}</p>
        </div>
      </div>

      {focusVehicle ? (
        <section className="section-shell p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.65fr] lg:items-start">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60">
              {focusVehicleImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={focusVehicleImageUrl}
                  alt={`${focusVehicle.vehicle.make} ${focusVehicle.vehicle.model}`}
                  className="h-full min-h-56 w-full object-cover"
                />
              ) : (
                <div className="flex min-h-56 items-center justify-center bg-foreground/5 text-muted">
                  <PhotoIcon className="h-10 w-10" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t.dashboard.connectionTitle}
              </h2>
              <p className="mt-1 text-sm text-muted">{t.dashboard.connectionCopy}</p>

              <div className="mt-4 grid gap-2 text-sm">
                <p>
                  {t.dashboard.focusVehicleLabel}: <strong>{focusVehicle.vehicle.make} {focusVehicle.vehicle.model}</strong>
                </p>
                <p className="text-muted">
                  {t.dashboard.lastActivityLabel}: {focusVehicle.latestCost
                    ? `${focusVehicle.latestCost.title} (${formatDate(focusVehicle.latestCost.date, locale)})`
                    : t.dashboard.noRecentActivity}
                </p>
                <p className="text-muted">
                  {t.dashboard.nextReminderLabel}: {nextReminderForFocus
                    ? `${nextReminderForFocus.title}${nextReminderForFocus.due_date ? ` (${formatDate(nextReminderForFocus.due_date, locale)})` : ""}`
                    : t.dashboard.noUpcomingReminder}
                </p>
              </div>

              <Link
                href={`/vehicles/${focusVehicle.vehicle.id}`}
                className="mt-4 inline-block rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-foreground/5"
              >
                {t.dashboard.openVehicleCta}
              </Link>
            </div>

            <div className="surface rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted">{t.dashboard.connectionScoreLabel}</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{connectionScore}/100</p>
              <p className="mt-2 text-xs text-muted">{t.dashboard.connectionScoreHint}</p>
            </div>
          </div>
        </section>
      ) : null}

      <DashboardInsights
        costs={allCosts}
        reminders={allReminders}
        vehicles={allVehicles.map((vehicle) => ({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
        }))}
        locale={locale}
      />

      {allVehicles.length === 0 ? (
        <div className="section-shell border-dashed p-8 text-center">
          <p className="text-muted">{t.dashboard.noVehicles}</p>
          <Link
            href="/vehicles/new"
            className="mt-4 inline-block rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            {t.dashboard.firstVehicle}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">{t.dashboard.yourVehicles}</h2>
            <p className="text-xs uppercase tracking-[0.15em] text-muted">{t.dashboard.openCardHint}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allVehicles.map((v) => {
              const stats = getVehicleStats(v.id);
              const primaryImageUrl = primaryImageMap[v.id] ?? undefined;

              return (
                <Link
                  key={v.id}
                  href={`/vehicles/${v.id}`}
                  className="surface block overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:bg-foreground/5"
                >
                  {primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImageUrl}
                      alt={`${v.make} ${v.model}`}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-foreground/5 text-muted">
                      <PhotoIcon className="h-8 w-8" />
                    </div>
                  )}

                  <div className="p-4">
                  <p className="font-semibold text-foreground">
                    {v.make} {v.model}
                  </p>
                  <p className="text-sm text-muted">
                    {v.year} · {v.license_plate}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span>
                      {t.dashboard.costsLabel}: <strong className="font-semibold">{formatCurrency(stats.totalCosts, locale)}</strong>
                    </span>
                    {stats.avgConsumption !== null && (
                      <span className="text-muted">
                        O {formatNumber(stats.avgConsumption, 1, locale)} L/100km
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-muted">
                    <div className="flex items-center justify-between gap-2">
                      <span>Kaufpreis</span>
                      <span className="font-medium text-foreground">{formatCurrency(v.purchase_price ?? 0, locale)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>Gesamtaufwand</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(stats.totalCosts + (v.purchase_price ?? 0), locale)}
                      </span>
                    </div>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


