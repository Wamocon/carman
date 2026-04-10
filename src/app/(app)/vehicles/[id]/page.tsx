import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, PhotoIcon } from "@/components/Icons";
import { CostLinesChart } from "@/components/CostLinesChart";
import {
  buildTrendRows,
  getCostDateBounds,
  monthRange,
} from "@/lib/cost-trend";
import { getLocaleFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  VEHICLE_STATUS,
  VEHICLE_STATUS_LABELS,
} from "@/lib/vehicle-status";
import {
  ACQUISITION_LABELS,
  calculateAcquisitionCost,
  convertKwToPs,
  STANDARD_EQUIPMENT,
} from "@/lib/vehicle-market";
import { localizeCatalogText } from "@/lib/vehicle-catalog";
import type {
  CostCategory,
  CostEntry,
  Reminder,
  UserProfile,
  Vehicle,
  VehicleComment,
  VehicleImage,
} from "@/types/domain";
import { ExportForm } from "@/app/(app)/export/ExportForm";
import { VehicleCommentForm } from "./VehicleCommentForm";
import { VehicleImageUploadForm } from "./VehicleImageUploadForm";
import { VehicleStandardCostPlanner } from "./VehicleStandardCostPlanner";
import { VehicleActions } from "./VehicleActions";
import { setPrimaryVehicleImage } from "./actions";

const CATEGORY_LABELS: Record<CostCategory, string> = {
  fuel: "Tanken",
  maintenance: "Wartung",
  repair: "Reparatur",
  insurance: "Versicherung",
  tax: "Steuer",
  leasing: "Leasing",
  parking: "Parken",
  other: "Sonstiges",
};

const VEHICLE_TABS = [
  { key: "overview", label: "Überblick" },
  { key: "costs", label: "Kosten" },
  { key: "reminders", label: "Servicetermine" },
  { key: "media", label: "Medien" },
  { key: "details", label: "Stammdaten" },
] as const;

type VehicleTab = (typeof VEHICLE_TABS)[number]["key"];

const STANDARD_EQUIPMENT_ITEMS = new Set(
  STANDARD_EQUIPMENT.flatMap((category) => category.items),
);

function parseSpecialEquipment(value: string | null): {
  categorized: Array<{ category: string; items: string[] }>;
  customItems: string[];
} {
  const entries = (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const categorized = STANDARD_EQUIPMENT.map((category) => ({
    category: category.category,
    items: category.items.filter((item) => entries.includes(item)),
  })).filter((category) => category.items.length > 0);

  const customItems = entries.filter((entry) => !STANDARD_EQUIPMENT_ITEMS.has(entry));

  return { categorized, customItems };
}

function isVehicleTab(value: string | undefined): value is VehicleTab {
  return VEHICLE_TABS.some((tab) => tab.key === value);
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("make, model")
    .eq("id", id)
    .single();

  return {
    title: vehicle
      ? `${vehicle.make} ${vehicle.model} — CarMan`
      : "Fahrzeug — CarMan",
  };
}

export default async function VehicleDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const locale = await getLocaleFromCookies();
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const activeTab: VehicleTab = isVehicleTab(searchParams.tab)
    ? searchParams.tab
    : "overview";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    redirect("/vehicles");
  }

  const v = vehicle as Vehicle;

  const [{ data: costs }, { data: reminders }, { data: comments }, { data: images }, { data: profile }] =
    await Promise.all([
      supabase
        .from("cost_entries")
        .select("*")
        .eq("vehicle_id", id)
        .order("date", { ascending: false }),
      supabase
        .from("reminders")
        .select("*")
        .eq("vehicle_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vehicle_comments")
        .select("*")
        .eq("vehicle_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vehicle_images")
        .select("*")
        .eq("vehicle_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("subscription_tier").eq("id", user.id).single(),
    ]);

  const vehicleCosts = (costs ?? []) as CostEntry[];
  const recentCosts = vehicleCosts.slice(0, 10);
  const allReminders = (reminders ?? []) as Reminder[];
  const vehicleComments = (comments ?? []) as VehicleComment[];
  const userProfile = profile as Pick<UserProfile, "subscription_tier"> | null;
  const vehicleImages = ((images ?? []) as VehicleImage[]).sort((left, right) => {
    if (left.is_primary !== right.is_primary) {
      return left.is_primary ? -1 : 1;
    }

    return right.created_at.localeCompare(left.created_at);
  });

  const imageLinks = await Promise.all(
    vehicleImages.map(async (image) => {
      const { data } = await supabase.storage
        .from("vehicle-images")
        .createSignedUrl(image.storage_path, 60 * 30);

      return {
        image,
        signedUrl: data?.signedUrl ?? null,
      };
    }),
  );

  const primaryImage =
    imageLinks.find((entry) => entry.image.is_primary) ?? imageLinks[0] ?? null;

  const totalRunningCosts = vehicleCosts.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  const saleEntry = vehicleCosts.find((entry) => entry.id === v.sale_cost_entry_id) ?? null;
  const acquisitionCost = calculateAcquisitionCost(v);
  const totalOwnershipCosts = totalRunningCosts + acquisitionCost;
  const isSold = v.status === VEHICLE_STATUS.sold;
  const canExportVehicle = userProfile?.subscription_tier === "pro";

  const fuelLabels: Record<string, string> = {
    petrol: "Benzin",
    diesel: "Diesel",
    electric: "Elektro",
    hybrid: "Hybrid",
    lpg: "LPG",
    cng: "CNG",
  };

  const trendBounds = getCostDateBounds(vehicleCosts);
  const trendMonths = trendBounds
    ? monthRange(trendBounds.startMonth, trendBounds.endMonth)
    : [];
  const monthlyTrend = buildTrendRows(vehicleCosts, trendMonths);
  const last12Months = monthlyTrend.slice(-12);
  const total12Months = last12Months.reduce((sum, item) => sum + item.total, 0);
  const average12Months = total12Months / Math.max(last12Months.length, 1);

  const categoryTotals12Months: Record<CostCategory, number> = {
    fuel: 0,
    maintenance: 0,
    repair: 0,
    insurance: 0,
    tax: 0,
    leasing: 0,
    parking: 0,
    other: 0,
  };

  for (const month of last12Months) {
    for (const category of Object.keys(categoryTotals12Months) as CostCategory[]) {
      categoryTotals12Months[category] += month.categories[category] ?? 0;
    }
  }

  const categoryRows = (Object.keys(categoryTotals12Months) as CostCategory[])
    .map((category) => ({ category, value: categoryTotals12Months[category] }))
    .filter((row) => row.value > 0)
    .sort((left, right) => right.value - left.value);

  const linkedReminderCount = vehicleCosts.filter(
    (entry) => entry.reminder_id,
  ).length;

  const headerMeta = [
    `${v.year}`,
    localizeCatalogText(v.variant, locale) ||
      fuelLabels[v.fuel_type] ||
      v.fuel_type,
    v.license_plate,
  ].filter(Boolean);

  const specialEquipmentView = parseSpecialEquipment(v.special_equipment);

  return (
    <div className="space-y-6">
      <section className="section-shell overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Fahrzeuge
            </Link>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
              CarMan Fahrzeugprofil
            </p>
          </div>
          <VehicleActions vehicleId={v.id} vehicleStatus={v.status} />
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60">
            {primaryImage?.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.signedUrl}
                alt={primaryImage.image.caption ?? `${v.make} ${v.model}`}
                className="h-64 w-full object-contain bg-foreground/5 p-2"
              />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 bg-foreground/5 text-muted">
                <PhotoIcon className="h-10 w-10" />
                <p className="text-sm">Noch kein Hauptbild gesetzt</p>
              </div>
            )}
          </div>

          <div>
            <h1 className="heading-display text-3xl font-semibold text-foreground">
              {v.make} {v.model}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isSold ? "bg-foreground/10 text-foreground/80" : "bg-brand/10 text-brand"
                }`}
              >
                {VEHICLE_STATUS_LABELS[v.status]}
              </span>
              {saleEntry ? (
                <Link
                  href={`/costs/${saleEntry.id}`}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:bg-foreground/5"
                >
                  Verkaufseintrag öffnen
                </Link>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted">{headerMeta.join(" · ")}</p>
            <p className="mt-1 text-sm text-muted">
              Kilometerstand: {v.current_mileage.toLocaleString(locale === "de" ? "de-DE" : "en-US")} km
            </p>
            {isSold ? (
              <div className="mt-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-foreground/85">
                <p>
                  Verkauft am {formatDate(saleEntry?.date ?? v.sold_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10), locale)}
                  {saleEntry ? ` · Erlös ${formatCurrency(Math.abs(saleEntry.amount), locale)}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Kosten, Servicetermine und globale Kennzahlen dieses Fahrzeugs werden außerhalb dieser Detailansicht nicht mehr in den Standardübersichten angezeigt.
                </p>
              </div>
            ) : null}
            <p className="mt-3 max-w-2xl text-sm help-copy">
              Die Fahrzeugidentität bleibt immer sichtbar. Darunter wechselst du
              per Reiter gezielt zwischen Überblick, Kosten, Serviceterminen,
              Medien und Stammdaten.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {!isSold ? (
                <>
                  <Link
                    href={`/costs/new?vehicle_id=${v.id}&category=fuel`}
                    className="rounded-xl bg-success px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Tanken
                  </Link>
                  <Link
                    href={`/costs/new?vehicle_id=${v.id}&category=maintenance`}
                    className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Wartung
                  </Link>
                  <Link
                    href={`/servicetermine/new?vehicle_id=${v.id}`}
                    className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
                  >
                    Servicetermin
                  </Link>
                </>
              ) : null}
              <Link
                href="?tab=media"
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
              >
                Bilder verwalten
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            {isSold ? "Saldo Fahrzeug" : "Betriebskosten"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {isSold ? "Kosten inklusive Verkaufserlös" : "Alle Kostenbuchungen für dieses Fahrzeug"}
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatCurrency(totalRunningCosts, locale)}
          </p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Anschaffungskosten
          </p>
          <p className="mt-2 text-sm text-muted">{ACQUISITION_LABELS[v.acquisition_type] ?? "Kauf"}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatCurrency(acquisitionCost, locale)}
          </p>
          {v.purchase_date ? (
            <p className="mt-1 text-xs text-muted">
              Datum: {formatDate(v.purchase_date, locale)}
            </p>
          ) : null}
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Gesamtaufwand
          </p>
          <p className="mt-2 text-sm text-muted">Betriebskosten plus Anschaffungskosten</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatCurrency(totalOwnershipCosts, locale)}
          </p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Serviceterminkosten
          </p>
          <p className="mt-2 text-sm text-muted">
            Kosten mit verknüpftem Servicetermin
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {linkedReminderCount}
          </p>
        </div>
      </section>

      <nav className="flex flex-wrap gap-2">
        {VEHICLE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Link
              key={tab.key}
              href={`?tab=${tab.key}`}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-brand/35 bg-brand/10 text-brand"
                  : "border-border bg-card text-foreground/75 hover:bg-foreground/5"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {activeTab === "overview" ? (
        <>
          <section className="section-shell space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Fahrzeug-Dashboard
                </h2>
                <p className="text-sm text-muted">
                  Monatliche Kostenentwicklung und Verteilung auf Basis aller
                  vorhandenen Einträge dieses Fahrzeugs.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted">
                {trendBounds
                  ? `Basis: ${trendBounds.startMonth} bis ${trendBounds.endMonth}`
                  : "Noch keine Kostendaten"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  Gesamtkosten 12M
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {formatCurrency(total12Months, locale)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  Durchschnitt 12M
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {formatCurrency(average12Months, locale)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  Offene Servicetermine
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {allReminders.filter((reminder) => !reminder.is_completed).length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  Bilder
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {imageLinks.length}
                </p>
              </div>
            </div>

            {categoryRows.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Kostenaufteilung (12M)
                </h3>
                {categoryRows.map((row) => {
                  const width = total12Months > 0 ? (row.value / total12Months) * 100 : 0;

                  return (
                    <div key={row.category}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                        <span className="text-foreground/85">
                          {CATEGORY_LABELS[row.category]}
                        </span>
                        <span className="text-muted">
                          {formatCurrency(row.value, locale)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10">
                        <div
                          className="h-2 rounded-full bg-brand/80"
                          style={{ width: `${Math.max(width, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Für dieses Fahrzeug liegen noch keine Kosten vor.
              </p>
            )}

            {monthlyTrend.length > 0 ? (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Kostenverlauf mit Durchschnitt
                </h3>
                <CostLinesChart data={monthlyTrend} locale={locale} />
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="section-shell space-y-3 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Letzte Kosten
              </h2>
              {recentCosts.length === 0 ? (
                <p className="text-sm text-muted">Keine Einträge vorhanden.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 pr-4 font-medium text-muted">Datum</th>
                        <th className="pb-2 pr-4 font-medium text-muted">Kategorie</th>
                        <th className="pb-2 pr-4 font-medium text-muted">Titel</th>
                        <th className="pb-2 text-right font-medium text-muted">Betrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCosts.map((costEntry) => (
                        <tr key={costEntry.id} className="border-b border-border/60">
                          <td className="py-2 pr-4">
                            {formatDate(costEntry.date, locale)}
                          </td>
                          <td className="py-2 pr-4">
                            {CATEGORY_LABELS[costEntry.category]}
                          </td>
                          <td className="py-2 pr-4">
                            <Link
                              href={`/costs/${costEntry.id}`}
                              className="font-medium text-brand hover:underline"
                            >
                              {costEntry.title}
                            </Link>
                          </td>
                          <td className="py-2 text-right">
                            {formatCurrency(costEntry.amount, locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="section-shell space-y-3 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Servicetermine
              </h2>
              {allReminders.length === 0 ? (
                <p className="text-sm text-muted">Keine Servicetermine vorhanden.</p>
              ) : (
                <ul className="space-y-2">
                  {allReminders.slice(0, 6).map((reminder) => (
                    <li
                      key={reminder.id}
                      className="rounded-xl border border-border/70 bg-card/60 p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {reminder.title}
                          </p>
                          <p className="text-xs text-muted">
                            {reminder.due_date
                              ? `Termin: ${formatDate(reminder.due_date, locale)}`
                              : "Kein Datum"}
                            {reminder.due_mileage
                              ? ` · ${reminder.due_mileage.toLocaleString("de-DE")} km`
                              : ""}
                          </p>
                        </div>
                        <Link
                          href={`/servicetermine/${reminder.id}`}
                          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5"
                        >
                          Öffnen
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </section>
        </>
      ) : null}

      {activeTab === "costs" ? (
        <>
          {!isSold ? <VehicleStandardCostPlanner vehicleId={v.id} fuelType={v.fuel_type} /> : null}

          <section className="section-shell space-y-3 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Kostenhistorie
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Exportiere die Kosten dieses Fahrzeugs gezielt nach Kategorien oder Zeitraum.
                </p>
              </div>
              {canExportVehicle ? (
                <div className="w-full max-w-md">
                  <ExportForm
                    vehicles={[{ id: v.id, make: v.make, model: v.model, status: v.status }]}
                    fixedVehicle={{ id: v.id, make: v.make, model: v.model, status: v.status }}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-amber-300/50 bg-amber-100/65 px-3 py-2 text-sm text-amber-800">
                  CSV-Export für einzelne Fahrzeuge ist im Pro-Tarif verfügbar.
                </div>
              )}
            </div>
            {recentCosts.length === 0 ? (
              <p className="text-sm text-muted">Keine Einträge vorhanden.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-muted">Datum</th>
                      <th className="pb-2 pr-4 font-medium text-muted">Kategorie</th>
                      <th className="pb-2 pr-4 font-medium text-muted">Titel</th>
                      <th className="pb-2 pr-4 font-medium text-muted">Servicetermin</th>
                      <th className="pb-2 text-right font-medium text-muted">Betrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCosts.map((costEntry) => (
                      <tr key={costEntry.id} className="border-b border-border/60">
                        <td className="py-2 pr-4">
                          {formatDate(costEntry.date, locale)}
                        </td>
                        <td className="py-2 pr-4">
                          {costEntry.is_vehicle_sale ? "Fahrzeugverkauf" : CATEGORY_LABELS[costEntry.category]}
                        </td>
                        <td className="py-2 pr-4">
                          <Link
                            href={`/costs/${costEntry.id}`}
                            className="font-medium text-brand hover:underline"
                          >
                            {costEntry.title}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted">
                          {costEntry.reminder_id ? "Verknüpft" : "-"}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(costEntry.amount, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      {activeTab === "reminders" ? (
        <section className="section-shell space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Servicetermine und Intervalle
              </h2>
              <p className="mt-1 text-sm text-muted">
                Jede Aufgabe kann direkt zu einem Kosteneintrag führen oder mit
                vorhandenen Kosten verknüpft werden.
              </p>
            </div>
            <Link
              href={`/servicetermine/new?vehicle_id=${v.id}`}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                isSold
                  ? "pointer-events-none border border-border bg-card text-muted"
                  : "bg-brand text-white hover:bg-brand-strong"
              }`}
            >
              {isSold ? "Nach Verkauf gesperrt" : "Neuer Servicetermin"}
            </Link>
          </div>

          {allReminders.length === 0 ? (
            <p className="text-sm text-muted">Keine Servicetermine vorhanden.</p>
          ) : (
            <div className="space-y-3">
              {allReminders.map((reminder) => (
                <article
                  key={reminder.id}
                  className="rounded-xl border border-border/70 bg-card/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{reminder.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {reminder.due_date
                          ? `Termin: ${formatDate(reminder.due_date, locale)}`
                          : "Ohne Datum"}
                        {reminder.due_mileage
                          ? ` · ${reminder.due_mileage.toLocaleString("de-DE")} km`
                          : ""}
                        {reminder.is_completed ? " · erledigt" : " · offen"}
                      </p>
                      {reminder.notes ? (
                        <p className="mt-2 text-sm text-muted">{reminder.notes}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/servicetermine/${reminder.id}`}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5"
                      >
                        Bearbeiten
                      </Link>
                      {!isSold ? (
                        <Link
                          href={`/costs/new?vehicle_id=${v.id}&category=maintenance&reminder_id=${reminder.id}&title=${encodeURIComponent(reminder.title)}&notes=${encodeURIComponent(`Erfasst aus Servicetermin: ${reminder.title}`)}`}
                          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-strong"
                        >
                          Kosten anhängen
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "media" ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="section-shell space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Fahrzeugbilder
            </h2>
            <VehicleImageUploadForm vehicleId={v.id} />

            {imageLinks.length === 0 ? (
              <p className="text-sm text-muted">Noch keine Bilder hochgeladen.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {imageLinks.map(({ image, signedUrl }) => (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-border/70 bg-card/60"
                  >
                    {signedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signedUrl}
                        alt={image.caption ?? image.file_name}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-foreground/5 text-xs text-muted">
                        Bild nicht verfügbar
                      </div>
                    )}
                    <div className="space-y-2 p-3 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">
                          {image.file_name}
                        </p>
                        {image.is_primary ? (
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">
                            Hauptbild
                          </span>
                        ) : null}
                      </div>
                      {image.caption ? (
                        <p className="text-muted">{image.caption}</p>
                      ) : null}
                      {!image.is_primary ? (
                        <form action={setPrimaryVehicleImage.bind(null, v.id, image.id)}>
                          <button
                            type="submit"
                            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5"
                          >
                            Als Hauptbild verwenden
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="section-shell space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Fahrzeug-Kommentare
            </h2>
            <VehicleCommentForm vehicleId={v.id} />
            {vehicleComments.length === 0 ? (
              <p className="text-sm text-muted">Noch keine Kommentare vorhanden.</p>
            ) : (
              <ul className="space-y-2">
                {vehicleComments.map((comment) => (
                  <li
                    key={comment.id}
                    className="rounded-xl border border-border/70 bg-card/60 p-3 text-sm"
                  >
                    <p className="text-foreground">{comment.body}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(comment.created_at.slice(0, 10), locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {activeTab === "details" ? (
        <>
          <section className="section-shell space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">
              Fahrzeugdetails
              </h2>
              <Link
                href={`/vehicles/${v.id}/edit`}
                className="rounded-xl bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-strong"
              >
                Fahrzeugdaten bearbeiten
              </Link>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {v.vin ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    VIN
                  </p>
                  <p className="mt-1 font-mono text-foreground">{v.vin}</p>
                </div>
              ) : null}
              {v.vehicle_type ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Fahrzeugtyp
                  </p>
                  <p className="mt-1 text-foreground">
                    {localizeCatalogText(v.vehicle_type, locale)}
                  </p>
                </div>
              ) : null}
              {v.body_style ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Karosserie
                  </p>
                  <p className="mt-1 text-foreground">
                    {localizeCatalogText(v.body_style, locale)}
                  </p>
                </div>
              ) : null}
              {v.engine_description ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Motorisierung
                  </p>
                  <p className="mt-1 text-foreground">
                    {localizeCatalogText(v.engine_description, locale)}
                  </p>
                </div>
              ) : null}
              {v.transmission ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Getriebe
                  </p>
                  <p className="mt-1 text-foreground">
                    {localizeCatalogText(v.transmission, locale)}
                  </p>
                </div>
              ) : null}
              {v.drive_type ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Antrieb
                  </p>
                  <p className="mt-1 text-foreground">
                    {localizeCatalogText(v.drive_type, locale)}
                  </p>
                </div>
              ) : null}
              {v.doors ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Türen
                  </p>
                  <p className="mt-1 text-foreground">{v.doors}</p>
                </div>
              ) : null}
              {v.engine_power_kw ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Leistung
                  </p>
                  <p className="mt-1 text-foreground">
                    {v.engine_power_kw} kW · {v.engine_power_ps ?? convertKwToPs(v.engine_power_kw)} PS
                  </p>
                </div>
              ) : v.engine_power_ps ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Leistung
                  </p>
                  <p className="mt-1 text-foreground">{v.engine_power_ps} PS</p>
                </div>
              ) : null}
              {v.engine_displacement_cc ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Hubraum
                  </p>
                  <p className="mt-1 text-foreground">
                    {v.engine_displacement_cc.toLocaleString("de-DE")} ccm
                  </p>
                </div>
              ) : null}
              {v.catalog_source ? (
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">
                    Datenquelle
                  </p>
                  <p className="mt-1 text-foreground">{v.catalog_source}</p>
                </div>
              ) : null}
            </div>
            {v.special_equipment ? (
              <div className="space-y-3 rounded-xl border border-border/70 p-3 text-sm">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">
                  Sonderausstattung
                </p>

                {specialEquipmentView.categorized.map((group) => (
                  <div key={group.category}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      {group.category}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-brand/25 bg-brand/8 px-2.5 py-1 text-xs font-medium text-brand"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {specialEquipmentView.customItems.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Weitere Angaben
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {specialEquipmentView.customItems.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
