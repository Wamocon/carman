import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { getPreferencesFromCookies } from "@/lib/preferences.server";
import type { UserProfile } from "@/types/domain";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, theme } = await getPreferencesFromCookies();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const userProfile: UserProfile = {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name,
    driver_first_name: profile.driver_first_name,
    driver_last_name: profile.driver_last_name,
    driver_birth_date: profile.driver_birth_date,
    driver_license_country: profile.driver_license_country,
    driver_license_issue_date: profile.driver_license_issue_date,
    driver_license_class: profile.driver_license_class,
    driver_profile_completed: profile.driver_profile_completed,
    subscription_tier: profile.subscription_tier,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent md:items-start md:flex-row">
      <Sidebar profile={userProfile} signOutAction={signOut} locale={locale} theme={theme} />
      <main className="min-w-0 flex-1 p-4 pb-8 md:p-8 lg:p-10">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

