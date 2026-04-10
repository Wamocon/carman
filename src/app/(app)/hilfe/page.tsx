import Link from "next/link";
import { getLocaleFromCookies } from "@/lib/preferences.server";

export const metadata = {
  title: "Hilfe — CarMan",
};

const QUICKSTART_STEPS = [
  { step: "1", text: "Melde dich an oder erstelle ein Konto.", link: "/login" },
  { step: "2", text: "Lege dein erstes Fahrzeug an.", link: "/vehicles/new" },
  { step: "3", text: "Erfasse den ersten Kosteneintrag.", link: "/costs/new" },
  { step: "4", text: "Erstelle einen Servicetermin.", link: "/servicetermine/new" },
  { step: "5", text: "Prüfe das Dashboard für die Übersicht.", link: "/dashboard" },
];

const CATEGORIES = [
  { key: "fuel", label: "Tanken" },
  { key: "maintenance", label: "Wartung" },
  { key: "repair", label: "Reparatur" },
  { key: "insurance", label: "Versicherung" },
  { key: "tax", label: "Steuer" },
  { key: "leasing", label: "Leasing" },
  { key: "parking", label: "Parken" },
  { key: "other", label: "Sonstiges" },
];

const FAQ_ITEMS = [
  {
    q: "Anmeldung funktioniert nicht",
    a: "Prüfe E-Mail und Passwort. Falls du dich nicht erinnern kannst, erstelle ein neues Konto.",
  },
  {
    q: "Kein Kosteneintrag möglich",
    a: "Du benötigst mindestens ein Fahrzeug. Lege zuerst unter \u2019Meine Autos\u2018 ein Fahrzeug an.",
  },
  {
    q: "Zweites Fahrzeug blockiert (Free-Tarif)",
    a: "Im Free-Tarif ist nur 1 Fahrzeug erlaubt. Wechsle zum Pro-Tarif für unbegrenzt viele.",
  },
  {
    q: "Export nicht verfügbar",
    a: "Der CSV-Export ist eine Pro-Funktion. Im Free-Tarif ist er gesperrt.",
  },
  {
    q: "Fahrzeug fehlt im Dashboard",
    a: "Verkaufte Fahrzeuge erscheinen nicht mehr im Dashboard. Unter \u2019Meine Autos\u2018 kannst du mit dem Statusfilter zwischen \u2019In Besitz\u2018, \u2019Verkauft\u2018 und \u2019Alle\u2018 wechseln.",
  },
  {
    q: "Export liefert keine Datei",
    a: "Es existieren keine Daten im gewählten Zeitraum. Erweitere den Zeitraum oder entferne den Fahrzeugfilter.",
  },
];

export default async function HelpPage() {
  const locale = await getLocaleFromCookies();
  const isDE = locale === "de";

  return (
    <div className="space-y-6 md:space-y-8 stagger-children">
      {/* Hero */}
      <section className="section-shell overflow-hidden p-5 sm:p-7">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {isDE ? "CarMan Hilfe" : "CarMan Help"}
          </p>
          <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            {isDE ? "Benutzerhandbuch" : "User Guide"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm help-copy sm:text-base">
            {isDE
              ? "Hier findest du alles, was du brauchst, um CarMan effektiv zu nutzen — von der Ersteinrichtung bis zu den Auswertungen."
              : "Everything you need to use CarMan effectively — from initial setup to analytics."}
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="section-shell p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          {isDE ? "Schnellstart in 5 Schritten" : "Quick Start in 5 Steps"}
        </h2>
        <p className="mt-1 text-sm help-copy">
          {isDE
            ? "Folge diesen Schritten, um sofort loszulegen."
            : "Follow these steps to get started right away."}
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICKSTART_STEPS.map((item) => (
            <li key={item.step}>
              <Link
                href={item.link}
                className="surface flex h-full flex-col rounded-xl p-4 transition-colors hover:bg-foreground/5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                  {item.step}
                </span>
                <span className="mt-2 text-sm text-foreground">{item.text}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Main Topics */}
      <div className="space-y-4">
        {/* Dashboard */}
        <details className="group section-shell" open>
          <summary className="flex cursor-pointer items-center justify-between p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-lg">📊</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
                <p className="text-xs text-muted">/dashboard</p>
              </div>
            </div>
            <span className="text-muted transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-3 border-t border-border/50 px-5 pb-5 pt-4 text-sm text-foreground/85 sm:px-6">
            <p>
              {isDE
                ? "Das Dashboard ist deine zentrale Übersicht. Hier siehst du:"
                : "The dashboard is your central overview. Here you see:"}
            </p>
            <ul className="list-inside list-disc space-y-1 pl-1 text-muted">
              <li>{isDE ? "Aktuelle Monatskosten" : "Current month costs"}</li>
              <li>{isDE ? "Kosten des Vormonats" : "Previous month costs"}</li>
              <li>{isDE ? "Anzahl deiner Fahrzeuge" : "Number of vehicles"}</li>
              <li>{isDE ? "Offene Servicetermine" : "Open service appointments"}</li>
            </ul>
            <p>
              {isDE
                ? "Direktaktionen ermöglichen sofortigen Zugriff auf:"
                : "Quick actions give you instant access to:"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/costs/new" className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20">
                {isDE ? "Kosten erfassen" : "Add cost"}
              </Link>
              <Link href="/servicetermine/new" className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20">
                {isDE ? "Servicetermin anlegen" : "Add reminder"}
              </Link>
              <Link href="/vehicles/new" className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20">
                {isDE ? "Fahrzeug hinzufügen" : "Add vehicle"}
              </Link>
            </div>
            <p className="text-muted">
              {isDE
                ? "Unterhalb der Kennzahlen findest du den Kostenverlauf und den Kategorienmix. Diese Widgets lassen sich einzeln ein- und ausblenden."
                : "Below the stats you'll find the cost trend and category mix. These widgets can be toggled on and off individually."}
            </p>
          </div>
        </details>

        {/* Vehicles */}
        <details className="group section-shell">
          <summary className="flex cursor-pointer items-center justify-between p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-lg">🚗</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isDE ? "Fahrzeuge" : "Vehicles"}
                </h2>
                <p className="text-xs text-muted">/vehicles</p>
              </div>
            </div>
            <span className="text-muted transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-4 border-t border-border/50 px-5 pb-5 pt-4 text-sm text-foreground/85 sm:px-6">
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Fahrzeugliste" : "Vehicle list"}</h3>
              <p className="mt-1 text-muted">
                {isDE
                  ? "Die Fahrzeugseite zeigt alle Fahrzeuge als Kacheln mit Grunddaten, Kilometerstand, Betriebskosten und Kaufpreis. Du kannst mit dem Statusfilter zwischen \u2019In Besitz\u2018, \u2019Verkauft\u2018 und \u2019Alle\u2018 wechseln."
                  : "The vehicles page shows all vehicles as cards with basic data, mileage, running costs, and purchase price. Use the status filter to switch between Owned, Sold, and All."}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Neues Fahrzeug anlegen" : "Add new vehicle"}</h3>
              <ol className="mt-1 list-inside list-decimal space-y-0.5 pl-1 text-muted">
                <li>{isDE ? "Optional: VIN eingeben und Daten automatisch befüllen" : "Optional: Enter VIN to auto-fill data"}</li>
                <li>{isDE ? "Pflichtfelder: Marke, Modell, Baujahr, Kennzeichen, Kilometerstand" : "Required: Make, model, year, license plate, mileage"}</li>
                <li>{isDE ? "Erwerbsart wählen: gekauft, finanziert oder geleast" : "Choose acquisition type: purchased, financed, or leased"}</li>
                <li>{isDE ? "Kaufpreis oder Vertragswerte eintragen" : "Enter purchase price or contract values"}</li>
                <li>{isDE ? "Speichern" : "Save"}</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Fahrzeugdetailseite" : "Vehicle detail page"}</h3>
              <p className="mt-1 text-muted">
                {isDE
                  ? "Auf der Detailseite findest du Schnellaktionen, Kennzahlen, den Kostenverlauf je Kategorie, den Standardkostenplaner, Stammdaten, Kommentare und eine Bildergalerie."
                  : "The detail page shows quick actions, stats, cost trend per category, the standard cost planner, master data, comments, and an image gallery."}
              </p>
            </div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-50/5 p-3">
              <h3 className="font-medium text-amber-400">{isDE ? "Fahrzeug verkaufen" : "Sell vehicle"}</h3>
              <ol className="mt-1 list-inside list-decimal space-y-0.5 pl-1 text-muted">
                <li>{isDE ? "Öffne die Detailseite des Fahrzeugs" : "Open the vehicle detail page"}</li>
                <li>{isDE ? "Klicke auf \u2019Fahrzeug verkaufen\u2018" : "Click 'Sell vehicle'"}</li>
                <li>{isDE ? "Verkaufspreis und Datum eintragen, optional einen Beleg hochladen" : "Enter sale price and date, optionally upload a receipt"}</li>
                <li>{isDE ? "Bestätigen — ein negativer Erlös-Eintrag wird automatisch angelegt" : "Confirm — a negative revenue entry is created automatically"}</li>
              </ol>
              <p className="mt-2 text-xs text-muted">
                {isDE
                  ? "Verkaufte Fahrzeuge verschwinden aus Dashboard, Kosten- und Terminübersichten. Die vollständige Historie bleibt in der Detailansicht erhalten."
                  : "Sold vehicles disappear from the dashboard, cost, and reminder overviews. The full history is preserved in the detail view."}
              </p>
            </div>
            <p className="text-xs text-muted">
              {isDE
                ? "Free-Tarif: max. 1 Fahrzeug. Pro-Tarif: unbegrenzt."
                : "Free tier: max 1 vehicle. Pro tier: unlimited."}
            </p>
          </div>
        </details>

        {/* Costs */}
        <details className="group section-shell">
          <summary className="flex cursor-pointer items-center justify-between p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-lg">💰</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isDE ? "Kosten" : "Costs"}
                </h2>
                <p className="text-xs text-muted">/costs</p>
              </div>
            </div>
            <span className="text-muted transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-4 border-t border-border/50 px-5 pb-5 pt-4 text-sm text-foreground/85 sm:px-6">
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Kostenübersicht" : "Cost overview"}</h3>
              <p className="mt-1 text-muted">
                {isDE
                  ? "Filtere nach Fahrzeug, Kategorie und Zeitraum. Die Tabelle zeigt Datum, Kategorie, Titel, Fahrzeug und Betrag."
                  : "Filter by vehicle, category, and time range. The table shows date, category, title, vehicle, and amount."}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Neuer Kosteneintrag" : "New cost entry"}</h3>
              <ol className="mt-1 list-inside list-decimal space-y-0.5 pl-1 text-muted">
                <li>{isDE ? "Fahrzeug auswählen" : "Select vehicle"}</li>
                <li>{isDE ? "Kategorie festlegen" : "Choose category"}</li>
                <li>{isDE ? "Titel, Betrag und Datum eintragen" : "Enter title, amount, and date"}</li>
                <li>{isDE ? "Optional: Kilometerstand, Liter, Preis pro Liter (bei Tanken), Notizen" : "Optional: Mileage, liters, price per liter (fuel), notes"}</li>
                <li>{isDE ? "Speichern" : "Save"}</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Kategorien" : "Categories"}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <span key={cat.key} className="rounded-lg bg-foreground/8 px-2.5 py-1 text-xs text-muted">
                    {cat.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Kostenposition im Detail" : "Cost entry details"}</h3>
              <p className="mt-1 text-muted">
                {isDE
                  ? "Öffne eine Position, um Kommentare hinzuzufügen, Rechnungen hochzuladen und einen ähnlichen Eintrag zu erstellen."
                  : "Open an entry to add comments, upload invoices, and create a similar entry."}
              </p>
            </div>
          </div>
        </details>

        {/* Reminders */}
        <details className="group section-shell">
          <summary className="flex cursor-pointer items-center justify-between p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-lg">🔔</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isDE ? "Servicetermine" : "Service Appointments"}
                </h2>
                <p className="text-xs text-muted">/servicetermine</p>
              </div>
            </div>
            <span className="text-muted transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-4 border-t border-border/50 px-5 pb-5 pt-4 text-sm text-foreground/85 sm:px-6">
            <p className="text-muted">
              {isDE
                ? "Servicetermine helfen dir, Wartungen, TÜV-Termine und andere Aufgaben im Blick zu behalten."
                : "Service appointments help you track maintenance, inspections, and other tasks."}
            </p>
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Neuen Termin erstellen" : "Create new appointment"}</h3>
              <ol className="mt-1 list-inside list-decimal space-y-0.5 pl-1 text-muted">
                <li>{isDE ? "Fahrzeug wählen" : "Choose vehicle"}</li>
                <li>{isDE ? "Titel vergeben" : "Set title"}</li>
                <li>{isDE ? "Art wählen: nach Datum, nach Kilometerstand oder beides" : "Choose type: by date, by mileage, or both"}</li>
                <li>{isDE ? "Entsprechende Werte setzen" : "Set the corresponding values"}</li>
                <li>{isDE ? "Speichern" : "Save"}</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{isDE ? "Verwaltung" : "Management"}</h3>
              <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1 text-muted">
                <li>{isDE ? "Servicetermine werden nach Fahrzeug gruppiert" : "Appointments are grouped by vehicle"}</li>
                <li>{isDE ? "Jeden Termin als erledigt markieren oder wieder öffnen" : "Mark each appointment as done or reopen it"}</li>
                <li>{isDE ? "Erledigte Termine mit dem Filter ein-/ausblenden" : "Toggle completed appointments with the filter"}</li>
                <li>{isDE ? "Kosten direkt mit einem Servicetermin verknüpfen" : "Link costs directly to an appointment"}</li>
              </ul>
            </div>
          </div>
        </details>

        {/* Export */}
        <details className="group section-shell">
          <summary className="flex cursor-pointer items-center justify-between p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-lg">📥</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isDE ? "Export (Pro)" : "Export (Pro)"}
                </h2>
                <p className="text-xs text-muted">/export</p>
              </div>
            </div>
            <span className="text-muted transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-3 border-t border-border/50 px-5 pb-5 pt-4 text-sm text-foreground/85 sm:px-6">
            <p className="text-muted">
              {isDE
                ? "Im Pro-Tarif kannst du deine Kosteneinträge als CSV-Datei exportieren."
                : "With a Pro subscription, you can export your cost entries as a CSV file."}
            </p>
            <ol className="list-inside list-decimal space-y-0.5 pl-1 text-muted">
              <li>{isDE ? "Optional: Fahrzeug auswählen" : "Optional: Select vehicle"}</li>
              <li>{isDE ? "Optional: Zeitraum (Von/Bis) eingrenzen" : "Optional: Filter by date range (from/to)"}</li>
              <li>{isDE ? "Kategorien wählen" : "Select categories"}</li>
              <li>{isDE ? "Export starten — CSV wird heruntergeladen" : "Start export — CSV is downloaded"}</li>
            </ol>
            <p className="text-xs text-muted">
              {isDE
                ? "Verkaufte Fahrzeuge exportierst du direkt auf der Fahrzeugdetailseite."
                : "Export sold vehicles directly from the vehicle detail page."}
            </p>
          </div>
        </details>

        {/* Settings */}
        <details className="group section-shell">
          <summary className="flex cursor-pointer items-center justify-between p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-lg">⚙️</span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isDE ? "Einstellungen" : "Settings"}
                </h2>
                <p className="text-xs text-muted">/settings</p>
              </div>
            </div>
            <span className="text-muted transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-3 border-t border-border/50 px-5 pb-5 pt-4 text-sm text-foreground/85 sm:px-6">
            <ul className="list-inside list-disc space-y-1 pl-1 text-muted">
              <li>{isDE ? "Anzeigename ändern" : "Change display name"}</li>
              <li>{isDE ? "Fahrerprofil vervollständigen" : "Complete driver profile"}</li>
              <li>{isDE ? "Sprache wählen (Deutsch / Englisch)" : "Choose language (German / English)"}</li>
              <li>{isDE ? "Designsprache wählen — inklusive Signature-Themes und Easter-Egg-Themes" : "Choose design language — including signature themes and easter egg themes"}</li>
              <li>{isDE ? "Abo-Status einsehen (Free / Pro)" : "View subscription status (Free / Pro)"}</li>
            </ul>
            <p className="text-xs text-muted">
              {isDE
                ? "In der Sidebar findest du einen Schnellwechsel für Hell/Dunkel, während die vollständige Theme-Auswahl unter Einstellungen liegt."
                : "The sidebar offers a quick light/dark toggle, while the full theme selection is in Settings."}
            </p>
          </div>
        </details>
      </div>

      {/* Subscription Tiers */}
      <section className="section-shell p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          {isDE ? "Tarife" : "Subscription Tiers"}
        </h2>
        <p className="mt-1 text-sm help-copy">
          {isDE
            ? "CarMan bietet zwei einfache Tarife."
            : "CarMan offers two straightforward tiers."}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="surface rounded-xl p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-foreground/8 px-2.5 py-0.5 text-xs font-medium text-muted">Free</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              <li>✓ 1 {isDE ? "Fahrzeug" : "vehicle"}</li>
              <li>✓ {isDE ? "Unbegrenzte Kosteneinträge" : "Unlimited cost entries"}</li>
              <li>✓ {isDE ? "Servicetermine" : "Service appointments"}</li>
              <li>✓ {isDE ? "Dashboard und Auswertungen" : "Dashboard and analytics"}</li>
              <li className="text-foreground/40">✗ CSV-Export</li>
            </ul>
          </div>
          <div className="surface rounded-xl border-brand/30 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-success/16 px-2.5 py-0.5 text-xs font-medium text-success">Pro</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              <li>✓ {isDE ? "Unbegrenzte Fahrzeuge" : "Unlimited vehicles"}</li>
              <li>✓ {isDE ? "Unbegrenzte Kosteneinträge" : "Unlimited cost entries"}</li>
              <li>✓ {isDE ? "Servicetermine" : "Service appointments"}</li>
              <li>✓ {isDE ? "Dashboard und Auswertungen" : "Dashboard and analytics"}</li>
              <li>✓ CSV-Export</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="section-shell p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          {isDE ? "Tipps für den Alltag" : "Everyday Tips"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            isDE ? "Kosten direkt nach dem Ereignis erfassen — so vergisst du nichts." : "Log costs right after the event — you won't forget anything.",
            isDE ? "Beim Tanken immer Kilometerstand, Liter und Literpreis eintragen — so berechnet CarMan den Durchschnittsverbrauch." : "Always enter mileage, liters, and price per liter when refueling — CarMan calculates average consumption.",
            isDE ? "Kommentare an Kostenpositionen nutzen, um Kontext festzuhalten." : "Use comments on cost entries to record context.",
            isDE ? "Rechnungen direkt an der Kostenposition hochladen — alles an einem Ort." : "Upload invoices directly on the cost entry — everything in one place.",
            isDE ? "Servicetermine am besten als Typ \u2019Beides\u2018 (Datum + km) anlegen." : "Best to create service appointments with type 'Both' (date + mileage).",
            isDE ? "Monatlich den Kostenverlauf im Dashboard prüfen, um Trends zu erkennen." : "Check the cost trend monthly in the dashboard to spot patterns.",
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 rounded-xl bg-foreground/3 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[10px] font-bold text-brand">
                ✓
              </span>
              <span className="text-sm text-muted">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-shell p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          {isDE ? "Häufige Fragen" : "FAQ"}
        </h2>
        <div className="mt-4 divide-y divide-border/40">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group/faq py-3 first:pt-0 last:pb-0">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-foreground">
                {item.q}
                <span className="ml-2 shrink-0 text-muted transition-transform group-open/faq:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Keyboard shortcuts / Quick Reference */}
      <section className="section-shell p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          {isDE ? "Kurzreferenz" : "Quick Reference"}
        </h2>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Dashboard", desc: isDE ? "Gesamtüberblick und schnelle Aktionen" : "Overview and quick actions", href: "/dashboard" },
            { label: isDE ? "Meine Autos" : "Vehicles", desc: isDE ? "Stammdaten, Bilder, Kommentare" : "Master data, images, comments", href: "/vehicles" },
            { label: isDE ? "Kosten" : "Costs", desc: isDE ? "Erfassung, Filterung, Details" : "Entry, filtering, details", href: "/costs" },
            { label: isDE ? "Servicetermine" : "Appointments", desc: isDE ? "Nach Zeit und Laufleistung" : "By date and mileage", href: "/servicetermine" },
            { label: "Export", desc: isDE ? "CSV-Berichte (Pro)" : "CSV reports (Pro)", href: "/export" },
            { label: isDE ? "Einstellungen" : "Settings", desc: isDE ? "Profil, Sprache, Design, Abo" : "Profile, language, theme, plan", href: "/settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl bg-foreground/3 px-4 py-3 transition-colors hover:bg-foreground/6"
            >
              <div>
                <span className="font-medium text-foreground">{item.label}</span>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
              <span className="text-muted">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
