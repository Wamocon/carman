import { PreferenceSwitches } from "@/components/PreferenceSwitches";
import { getDictionary } from "@/lib/i18n";
import { getPreferencesFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/domain";
import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Einstellungen — CarMan",
};

export default async function SettingsPage() {
  const { locale, theme } = await getPreferencesFromCookies();
  const t = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile = profile as UserProfile | null;

  if (!userProfile) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{t.settingsPage.eyebrow}</p>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">{t.settingsPage.title}</h1>
            <p className="mt-2 text-sm help-copy">{t.settingsPage.copy}</p>
          </div>
          <div className="sm:w-56">
            <PreferenceSwitches locale={locale} theme={theme} />
          </div>
        </div>
      </section>

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">{t.settingsPage.profileTitle}</h2>
        <div className="rounded-xl border border-border p-4 text-sm">
          <p>
            <span className="text-muted">{t.settingsPage.email}:</span>{" "}
            {userProfile.email}
          </p>
          <p className="mt-1">
            <span className="text-muted">{t.settingsPage.memberSince}:</span>{" "}
            {new Date(userProfile.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}
          </p>
        </div>

        <SettingsForm displayName={userProfile.display_name ?? ""} locale={locale} />
      </section>

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">{t.settingsPage.subscriptionTitle}</h2>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                userProfile.subscription_tier === "pro"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {userProfile.subscription_tier === "pro" ? t.common.pro : t.common.free}
            </span>
          </div>
          {userProfile.subscription_tier === "free" && (
            <p className="mt-3 text-sm text-muted">
              {t.settingsPage.upgradeCopy}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}


