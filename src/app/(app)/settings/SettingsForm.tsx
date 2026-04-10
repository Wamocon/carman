"use client";

import { useActionState } from "react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";
import type { UserProfile } from "@/types/domain";
import { updateProfile } from "./actions";

export function SettingsForm({
  profile,
  locale,
}: {
  profile: UserProfile;
  locale: Locale;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, {
    error: null,
    success: false,
  });
  const t = getDictionary(locale);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
          {t.settingsForm.success}
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-foreground">
          {t.settingsForm.displayName}
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name ?? ""}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <section className="rounded-xl border border-border/70 bg-card/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">{t.settingsForm.driverProfileTitle}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              profile.driver_profile_completed
                ? "bg-success/20 text-success"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {profile.driver_profile_completed
              ? t.settingsForm.driverProfileComplete
              : t.settingsForm.driverProfileIncomplete}
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="driver_first_name" className="block text-sm font-medium text-foreground">
              {t.settingsForm.driverFirstName}
            </label>
            <input
              id="driver_first_name"
              name="driver_first_name"
              type="text"
              defaultValue={profile.driver_first_name ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label htmlFor="driver_last_name" className="block text-sm font-medium text-foreground">
              {t.settingsForm.driverLastName}
            </label>
            <input
              id="driver_last_name"
              name="driver_last_name"
              type="text"
              defaultValue={profile.driver_last_name ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label htmlFor="driver_birth_date" className="block text-sm font-medium text-foreground">
              {t.settingsForm.driverBirthDate}
            </label>
            <input
              id="driver_birth_date"
              name="driver_birth_date"
              type="date"
              defaultValue={profile.driver_birth_date ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label htmlFor="driver_license_country" className="block text-sm font-medium text-foreground">
              {t.settingsForm.driverLicenseCountry}
            </label>
            <input
              id="driver_license_country"
              name="driver_license_country"
              type="text"
              maxLength={2}
              defaultValue={profile.driver_license_country ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 uppercase text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label htmlFor="driver_license_issue_date" className="block text-sm font-medium text-foreground">
              {t.settingsForm.driverLicenseIssueDate}
            </label>
            <input
              id="driver_license_issue_date"
              name="driver_license_issue_date"
              type="date"
              defaultValue={profile.driver_license_issue_date ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label htmlFor="driver_license_class" className="block text-sm font-medium text-foreground">
              {t.settingsForm.driverLicenseClass}
            </label>
            <input
              id="driver_license_class"
              name="driver_license_class"
              type="text"
              defaultValue={profile.driver_license_class ?? ""}
              className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? t.common.saving : t.common.save}
      </button>
    </form>
  );
}

