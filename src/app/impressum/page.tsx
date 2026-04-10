import { LEGAL_COMPANY, LEGAL_PRODUCT, LEGAL_UPDATED_AT } from "@/lib/legal";

export const metadata = {
  title: "Impressum - CarMan",
};

export default function ImprintPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="section-shell w-full space-y-6 p-6 sm:p-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Rechtliches</p>
          <h1 className="heading-display text-3xl font-semibold text-foreground sm:text-4xl">Impressum</h1>
          <p className="text-sm help-copy">Stand: {LEGAL_UPDATED_AT}</p>
        </header>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Anbieter</h2>
          <div className="mt-3 space-y-1 text-sm text-foreground/85">
            <p>{LEGAL_COMPANY.name}</p>
            <p>{LEGAL_COMPANY.street}</p>
            <p>{LEGAL_COMPANY.postalCode} {LEGAL_COMPANY.city}</p>
            <p>{LEGAL_COMPANY.country}</p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Kontakt</h2>
          <div className="mt-3 space-y-1 text-sm text-foreground/85">
            <p>Telefon: {LEGAL_COMPANY.phone}</p>
            <p>E-Mail: {LEGAL_COMPANY.email}</p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Vertretungsberechtigt</h2>
          <p className="mt-3 text-sm text-foreground/85">Geschäftsführer: {LEGAL_COMPANY.managingDirector}</p>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Registereintrag</h2>
          <div className="mt-3 space-y-1 text-sm text-foreground/85">
            <p>{LEGAL_COMPANY.commercialRegister}</p>
            <p>Umsatzsteuer-Identifikationsnummer: {LEGAL_COMPANY.vatId}</p>
          </div>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Angaben zum Angebot</h2>
          <p className="mt-3 text-sm text-foreground/85">
            {LEGAL_PRODUCT.name} ist eine webbasierte Anwendung fuer {LEGAL_PRODUCT.description}.
            Das Angebot richtet sich an Privatnutzer sowie gewerbliche Nutzer, die ihre Fahrzeugdaten zentral organisieren moechten.
          </p>
        </section>
      </div>
    </main>
  );
}