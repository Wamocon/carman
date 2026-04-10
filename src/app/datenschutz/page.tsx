import { LEGAL_COMPANY, LEGAL_PRODUCT, LEGAL_UPDATED_AT } from "@/lib/legal";

export const metadata = {
  title: "Datenschutz - CarMan",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="section-shell w-full space-y-6 p-6 sm:p-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Rechtliches</p>
          <h1 className="heading-display text-3xl font-semibold text-foreground sm:text-4xl">Datenschutzerklaerung</h1>
          <p className="text-sm help-copy">Stand: {LEGAL_UPDATED_AT}</p>
        </header>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">1. Verantwortlicher</h2>
          <div className="mt-3 space-y-1 text-sm text-foreground/85">
            <p>{LEGAL_COMPANY.name}</p>
            <p>{LEGAL_COMPANY.street}</p>
            <p>{LEGAL_COMPANY.postalCode} {LEGAL_COMPANY.city}</p>
            <p>Telefon: {LEGAL_COMPANY.phone}</p>
            <p>E-Mail: {LEGAL_COMPANY.email}</p>
            <p>Geschaeftsfuehrer: {LEGAL_COMPANY.managingDirector}</p>
            <p>Handelsregister: {LEGAL_COMPANY.commercialRegister}</p>
            <p>USt-ID: {LEGAL_COMPANY.vatId}</p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">2. Ueberblick ueber die Datenverarbeitung</h2>
          <p className="mt-3 text-sm text-foreground/85">
            Diese Datenschutzerklaerung gilt fuer die Website und Webanwendung {LEGAL_PRODUCT.name}. Wir verarbeiten personenbezogene Daten nur,
            soweit dies zur Bereitstellung einer funktionsfaehigen Plattform sowie unserer Inhalte und Leistungen erforderlich ist.
          </p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">3. Rechtsgrundlagen</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-foreground/85">
            <li>Einwilligung gemaess Art. 6 Abs. 1 lit. a DSGVO</li>
            <li>Vertragserfuellung gemaess Art. 6 Abs. 1 lit. b DSGVO</li>
            <li>Rechtliche Verpflichtung gemaess Art. 6 Abs. 1 lit. c DSGVO</li>
            <li>Berechtigtes Interesse gemaess Art. 6 Abs. 1 lit. f DSGVO</li>
          </ul>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">4. Hosting und Infrastruktur</h2>
          <div className="mt-3 space-y-3 text-sm text-foreground/85">
            <p>
              <span className="font-medium text-foreground">Vercel</span>: Die Website wird ueber Vercel gehostet. Dabei koennen technisch notwendige
              Verbindungsdaten wie IP-Adresse, Zeitstempel und Browserinformationen verarbeitet werden.
            </p>
            <p>
              <span className="font-medium text-foreground">Supabase</span>: Fuer Datenbank, Authentifizierung, Dateispeicher und Teile der
              Backend-Infrastruktur nutzen wir Supabase. Verarbeitet werden Authentifizierungsdaten, Session-Informationen, Fahrzeugdaten,
              Kosten- und Servicetermin-Daten sowie hochgeladene Dateien.
            </p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">5. Erhebung personenbezogener Daten</h2>
          <div className="mt-3 space-y-3 text-sm text-foreground/85">
            <p>
              <span className="font-medium text-foreground">Registrierung und Nutzerkonto</span>: Bei der Registrierung erheben wir Anzeigename,
              E-Mail-Adresse und Passwort. Optional koennen weitere Profildaten wie Fahrerinformationen gepflegt werden.
            </p>
            <p>
              <span className="font-medium text-foreground">Nutzungsdaten</span>: Im Rahmen der Anwendung werden Fahrzeugdaten, Kosteneintraege,
              Servicetermine, Kommentare und hochgeladene Bilder verarbeitet, soweit dies fuer die Nutzung von {LEGAL_PRODUCT.name} erforderlich ist.
            </p>
            <p>
              <span className="font-medium text-foreground">Server-Logfiles</span>: Beim Zugriff werden technisch erforderliche Daten wie IP-Adresse,
              Datum und Uhrzeit, aufgerufene Seite sowie Browserinformationen verarbeitet.
            </p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
          <p className="mt-3 text-sm text-foreground/85">
            {LEGAL_PRODUCT.name} verwendet technisch notwendige Cookies fuer Session-Management, Spracheinstellungen und Authentifizierung.
          </p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">7. Rechte betroffener Personen</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-foreground/85">
            <li>Auskunft gemaess Art. 15 DSGVO</li>
            <li>Berichtigung gemaess Art. 16 DSGVO</li>
            <li>Loeschung gemaess Art. 17 DSGVO</li>
            <li>Einschraenkung der Verarbeitung gemaess Art. 18 DSGVO</li>
            <li>Datenuebertragbarkeit gemaess Art. 20 DSGVO</li>
            <li>Widerspruch gemaess Art. 21 DSGVO</li>
            <li>Widerruf erteilter Einwilligungen gemaess Art. 7 Abs. 3 DSGVO</li>
            <li>Beschwerde bei einer Aufsichtsbehoerde gemaess Art. 77 DSGVO</li>
          </ul>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">8. Datensicherheit</h2>
          <p className="mt-3 text-sm text-foreground/85">
            Wir setzen technische und organisatorische Sicherheitsmassnahmen ein, um Ihre Daten gegen Verlust, Zerstoerung, Manipulation und unbefugten Zugriff zu schuetzen.
          </p>
        </section>
      </div>
    </main>
  );
}