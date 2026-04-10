import { LEGAL_COMPANY, LEGAL_PRODUCT, LEGAL_UPDATED_AT } from "@/lib/legal";

export const metadata = {
  title: "AGB - CarMan",
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="section-shell w-full space-y-6 p-6 sm:p-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Rechtliches</p>
          <h1 className="heading-display text-3xl font-semibold text-foreground sm:text-4xl">Allgemeine Geschaeftsbedingungen</h1>
          <p className="text-sm help-copy">Stand: {LEGAL_UPDATED_AT}</p>
        </header>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 1 Geltungsbereich</h2>
          <div className="mt-3 space-y-3 text-sm text-foreground/85">
            <p>
              Diese AGB gelten fuer die Nutzung der webbasierten Anwendung {LEGAL_PRODUCT.name}, angeboten von {LEGAL_COMPANY.name}, {LEGAL_COMPANY.street},
              {LEGAL_COMPANY.postalCode} {LEGAL_COMPANY.city}.
            </p>
            <p>
              Das Angebot richtet sich an Privatnutzer und gewerbliche Nutzer, die Fahrzeuge, Kosten und Servicetermine digital organisieren moechten.
            </p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 2 Vertragsschluss</h2>
          <div className="mt-3 space-y-3 text-sm text-foreground/85">
            <p>Die Darstellung der Anwendung stellt kein rechtlich bindendes Angebot dar, sondern eine Aufforderung zur Nutzung bzw. Registrierung.</p>
            <p>Ein Nutzungsvertrag kommt zustande, wenn ein Nutzer ein Konto registriert und der Zugang aktiviert wird.</p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 3 Leistungsbeschreibung</h2>
          <p className="mt-3 text-sm text-foreground/85">
            {LEGAL_PRODUCT.name} ermoeglicht {LEGAL_PRODUCT.description}. Der konkrete Funktionsumfang richtet sich nach dem jeweils aktuell angebotenen Free- oder Pro-Tarif.
          </p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 4 Nutzungsrechte</h2>
          <p className="mt-3 text-sm text-foreground/85">
            Nutzer erhalten fuer die Dauer des Vertrags ein einfaches, nicht uebertragbares Recht zur Nutzung der Anwendung im Rahmen der bereitgestellten Funktionen.
          </p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 5 Pflichten der Nutzer</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-foreground/85">
            <li>Zugangsdaten sind vertraulich zu behandeln und vor dem Zugriff Dritter zu schuetzen.</li>
            <li>Die Nutzung der Anwendung muss im Einklang mit geltendem Recht erfolgen.</li>
            <li>Es duerfen keine rechtswidrigen oder missbraeuchlichen Inhalte eingestellt werden.</li>
          </ul>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 6 Verfuegbarkeit</h2>
          <p className="mt-3 text-sm text-foreground/85">
            Wir bemuehen uns um eine moeglichst unterbrechungsfreie Bereitstellung von {LEGAL_PRODUCT.name}. Wartungsfenster und technisch notwendige Unterbrechungen koennen vorkommen.
          </p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 7 Datenschutz</h2>
          <p className="mt-3 text-sm text-foreground/85">Die Verarbeitung personenbezogener Daten richtet sich nach der gesonderten Datenschutzerklaerung.</p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 8 Haftung</h2>
          <div className="mt-3 space-y-3 text-sm text-foreground/85">
            <p>Wir haften unbeschraenkt bei Vorsatz, grober Fahrlaessigkeit sowie bei Schaeden aus der Verletzung von Leben, Koerper oder Gesundheit.</p>
            <p>Im Uebrigen ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt, soweit gesetzlich zulaessig.</p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 9 Vertragsdauer und Kuendigung</h2>
          <p className="mt-3 text-sm text-foreground/85">
            Nutzer koennen ihr Konto jederzeit im Rahmen der angebotenen Funktionen kuendigen oder loeschen. Das Recht zur ausserordentlichen Kuendigung aus wichtigem Grund bleibt unberuehrt.
          </p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">§ 10 Schlussbestimmungen</h2>
          <div className="mt-3 space-y-3 text-sm text-foreground/85">
            <p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</p>
            <p>Sofern gesetzlich zulaessig, ist Gerichtsstand Eschborn.</p>
            <p>Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der uebrigen Bestimmungen unberuehrt.</p>
          </div>
        </section>
      </div>
    </main>
  );
}