import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LegalLinks } from "@/components/LegalLinks";
import { PreferenceSwitches } from "@/components/PreferenceSwitches";
import { getDictionary } from "@/lib/i18n";
import { getPreferencesFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Registrieren — CarMan",
};

export default async function RegisterPage() {
  const { locale, theme } = await getPreferencesFromCookies();
  const t = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="section-shell grid w-full max-w-5xl gap-8 p-5 sm:p-8 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-brand p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9 rounded-md border border-white/35 bg-white/10" alt={`${t.appName} logo`} />
              <p className="text-xs uppercase tracking-[0.2em] text-white/75">{t.appName}</p>
            </div>
            <div className="w-full max-w-[17rem] rounded-[1.4rem] border border-white/18 bg-slate-950/12 p-3 shadow-[0_26px_50px_-38px_rgba(15,23,42,0.7)] backdrop-blur-md">
              <PreferenceSwitches locale={locale} theme={theme} compact />
            </div>
          </div>
          <h1 className="heading-display mt-3 text-3xl font-semibold sm:text-4xl">
            {t.registerPage.heroTitle}
          </h1>
          <p className="mt-4 text-sm text-white/90 sm:text-base">
            {t.registerPage.heroCopy}
          </p>
          <ol className="mt-6 space-y-2 text-sm text-white/85">
            {t.registerPage.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{t.registerPage.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{t.registerPage.title}</h2>
            <p className="mt-1 text-sm help-copy">{t.registerPage.leadCopy}</p>
          </div>

          <div className="mt-5">
            <RegisterForm locale={locale} />
          </div>

          <p className="mt-4 text-center text-sm text-muted sm:text-left">
            {t.registerPage.haveAccount}{" "}
            <a href="/login" className="font-medium text-brand hover:underline">
              {t.registerPage.loginCta}
            </a>
          </p>

          <LegalLinks
            locale={locale}
            className="mt-5 flex flex-wrap gap-2"
            linkClassName="rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-foreground/5 hover:text-foreground"
          />
        </section>
      </div>
    </main>
  );
}


