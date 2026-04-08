import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/domain";
import { SettingsForm } from "./SettingsForm";

export const metadata = {
  title: "Einstellungen — Smart Car Manager",
};

export default async function SettingsPage() {
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
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>

      {/* Profile info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Profil</h2>
        <div className="rounded-lg border border-foreground/10 p-4 text-sm">
          <p>
            <span className="text-foreground/60">E-Mail:</span>{" "}
            {userProfile.email}
          </p>
          <p className="mt-1">
            <span className="text-foreground/60">Mitglied seit:</span>{" "}
            {new Date(userProfile.created_at).toLocaleDateString("de-DE")}
          </p>
        </div>

        <SettingsForm displayName={userProfile.display_name ?? ""} />
      </section>

      {/* Subscription */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Abonnement</h2>
        <div className="rounded-lg border border-foreground/10 p-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                userProfile.subscription_tier === "pro"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {userProfile.subscription_tier === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          {userProfile.subscription_tier === "free" && (
            <p className="mt-3 text-sm text-foreground/60">
              Upgrade auf Pro für unbegrenzte Fahrzeuge, Datenexport und mehr.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
