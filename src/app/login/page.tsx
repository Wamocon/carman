import { redirect } from "next/navigation";
import { PreferenceSwitches } from "@/components/PreferenceSwitches";
import { getDictionary } from "@/lib/i18n";
import { getPreferencesFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Anmelden — CarMan",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
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
        <section className="rounded-2xl bg-gradient-to-br from-brand/95 via-brand-strong to-cyan-500 p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">{t.appName}</p>
            <div className="w-full max-w-[17rem] rounded-[1.4rem] border border-white/18 bg-slate-950/12 p-3 shadow-[0_26px_50px_-38px_rgba(15,23,42,0.7)] backdrop-blur-md">
              <PreferenceSwitches locale={locale} theme={theme} compact />
            </div>
          </div>
          <h1 className="heading-display mt-3 text-3xl font-semibold sm:text-4xl">
            {t.loginPage.heroTitle}
          </h1>
          <p className="mt-4 text-sm text-white/90 sm:text-base">
            {t.loginPage.heroCopy}
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/85">
            {t.loginPage.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6">
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{t.loginPage.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{t.loginPage.title}</h2>
            <p className="mt-1 text-sm help-copy">{t.loginPage.leadCopy}</p>
          </div>

          <div className="mt-5">
            <LoginForm error={searchParams.error} locale={locale} />
          </div>

          <p className="mt-4 text-center text-sm text-muted sm:text-left">
            {t.loginPage.noAccount}{" "}
            <a href="/register" className="font-medium text-brand hover:underline">
              {t.loginPage.registerCta}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}


