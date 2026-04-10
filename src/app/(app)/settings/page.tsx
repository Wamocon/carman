import { getPreferencesFromCookies } from "@/lib/preferences.server";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/domain";
import { SettingsTabs } from "./SettingsTabs";

export const metadata = {
  title: "Einstellungen — CarMan",
};

export default async function SettingsPage() {
  const { locale, theme } = await getPreferencesFromCookies();
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
    <div className="mx-auto max-w-3xl space-y-8 stagger-children">
      <section className="section-shell p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CarMan Konto</p>
        <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Einstellungen</h1>
        <p className="mt-2 text-sm help-copy">Verwalte Oberfläche, Profil und dein Nutzungsmodell.</p>
      </section>

      <SettingsTabs profile={userProfile} locale={locale} theme={theme} />
    </div>
  );
}


