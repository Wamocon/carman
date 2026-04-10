"use client";

import { useCallback, useState } from "react";
import { PreferenceSwitches } from "@/components/PreferenceSwitches";
import type { Locale, Theme } from "@/lib/preferences";
import type { UserProfile } from "@/types/domain";
import { SettingsForm } from "./SettingsForm";
import { SubscriptionCard } from "./SubscriptionCard";

type SettingsTab = "appearance" | "profile" | "subscription";

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-brand text-white shadow-sm"
          : "text-muted hover:bg-foreground/5 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function SettingsTabs({
  profile,
  locale,
  theme,
}: {
  profile: UserProfile;
  locale: Locale;
  theme: Theme;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const isDE = locale === "de";

  const handleTab = useCallback((tab: SettingsTab) => setActiveTab(tab), []);

  const memberSinceDate = new Date(profile.created_at).toLocaleDateString(
    locale === "de" ? "de-DE" : "en-US",
  );

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="section-shell flex flex-wrap gap-1.5 p-1.5">
        <Tab active={activeTab === "appearance"} onClick={() => handleTab("appearance")}>
          {isDE ? "Oberfläche" : "Appearance"}
        </Tab>
        <Tab active={activeTab === "profile"} onClick={() => handleTab("profile")}>
          {isDE ? "Profil" : "Profile"}
        </Tab>
        <Tab active={activeTab === "subscription"} onClick={() => handleTab("subscription")}>
          {isDE ? "Nutzungsmodell" : "Subscription"}
        </Tab>
      </div>

      {/* Appearance tab */}
      {activeTab === "appearance" && (
        <section key="appearance" className="section-shell animate-fade-in space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isDE ? "Oberfläche & Sprache" : "Interface & Language"}
            </h2>
            <p className="mt-1 text-sm help-copy">
              {isDE
                ? "Nutze den schnellen Hell/Dunkel-Wechsel und wähle ein Signature-Theme oder das geheime Most-Wanted-Design."
                : "Use the quick light/dark switch and choose a signature theme or the secret Most Wanted palette."}
            </p>
          </div>
          <PreferenceSwitches locale={locale} theme={theme} />
        </section>
      )}

      {/* Profile tab */}
      {activeTab === "profile" && (
        <section key="profile" className="section-shell animate-fade-in space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {isDE ? "Profil" : "Profile"}
          </h2>
          <div className="rounded-xl border border-border p-4 text-sm">
            <p>
              <span className="text-muted">{isDE ? "E-Mail" : "Email"}:</span>{" "}
              {profile.email}
            </p>
            <p className="mt-1">
              <span className="text-muted">{isDE ? "Mitglied seit" : "Member since"}:</span>{" "}
              {memberSinceDate}
            </p>
          </div>
          <SettingsForm profile={profile} locale={locale} />
        </section>
      )}

      {/* Subscription tab */}
      {activeTab === "subscription" && (
        <section key="subscription" className="section-shell animate-fade-in space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isDE ? "Nutzungsmodell" : "Subscription"}
            </h2>
            <p className="mt-1 text-sm help-copy">
              {isDE
                ? "Upgrade auf Pro für unbegrenzte Fahrzeuge, Datenexport und KI-Funktionen."
                : "Upgrade to Pro for unlimited vehicles, data export, and AI features."}
            </p>
          </div>
          <SubscriptionCard tier={profile.subscription_tier} locale={locale} />
        </section>
      )}
    </div>
  );
}
