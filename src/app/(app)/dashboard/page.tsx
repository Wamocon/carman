import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Vehicle, CostEntry, Reminder } from "@/types/domain";

export const metadata = {
  title: "Dashboard — Smart Car Manager",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: vehicles },
    { data: costEntries },
    { data: reminders },
  ] = await Promise.all([
    supabase.from("vehicles").select("*").eq("user_id", user.id),
    supabase.from("cost_entries").select("*").eq("user_id", user.id),
    supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_completed", false),
  ]);

  const allVehicles = (vehicles ?? []) as Vehicle[];
  const allCosts = (costEntries ?? []) as CostEntry[];
  const allReminders = (reminders ?? []) as Reminder[];

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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-foreground/10 p-4">
          <p className="text-sm text-foreground/60">Kosten diesen Monat</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(costsThisMonth)}</p>
        </div>
        <div className="rounded-lg border border-foreground/10 p-4">
          <p className="text-sm text-foreground/60">Kosten letzten Monat</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(costsLastMonth)}</p>
        </div>
        <div className="rounded-lg border border-foreground/10 p-4">
          <p className="text-sm text-foreground/60">Fahrzeuge</p>
          <p className="mt-1 text-2xl font-bold">{allVehicles.length}</p>
        </div>
        <div className="rounded-lg border border-foreground/10 p-4">
          <p className="text-sm text-foreground/60">Offene Erinnerungen</p>
          <p className="mt-1 text-2xl font-bold">{upcomingReminders.length}</p>
        </div>
      </div>

      {/* Per vehicle */}
      {allVehicles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-foreground/20 p-8 text-center">
          <p className="text-foreground/60">Noch keine Fahrzeuge vorhanden.</p>
          <Link
            href="/vehicles/new"
            className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Erstes Fahrzeug hinzufügen
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Deine Fahrzeuge</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allVehicles.map((v) => {
              const stats = getVehicleStats(v.id);
              return (
                <Link
                  key={v.id}
                  href={`/vehicles/${v.id}`}
                  className="block rounded-lg border border-foreground/10 p-4 transition-colors hover:bg-foreground/5"
                >
                  <p className="font-semibold">
                    {v.make} {v.model}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {v.year} · {v.license_plate}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span>
                      Kosten: <strong>{formatCurrency(stats.totalCosts)}</strong>
                    </span>
                    {stats.avgConsumption !== null && (
                      <span>
                        Ø {formatNumber(stats.avgConsumption)} L/100km
                      </span>
                    )}
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
