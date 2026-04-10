"use client";

import { useActionState } from "react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";
import { register } from "./actions";

export function RegisterForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState(register, {
    error: null,
    success: false,
  });
  const t = getDictionary(locale);

  if (state.success) {
    return (
      <div className="rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success">
        {t.registerForm.success}
      </div>
    );
  }

  const driverInputClass =
    "mt-1 block h-11 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
  const driverLabelClass = "block min-h-[2.75rem] text-sm font-medium text-foreground";

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-foreground">
          {t.registerForm.displayName}
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder={t.registerForm.displayNamePlaceholder}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          {t.registerForm.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          placeholder={t.registerForm.emailPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          {t.registerForm.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <section className="rounded-xl border border-border/70 bg-card/60 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">{t.registerForm.driverProfileTitle}</p>
        <p className="mt-1 text-xs text-muted">{t.registerForm.driverProfileHint}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="driver_first_name" className={driverLabelClass}>
              {t.registerForm.driverFirstName}
            </label>
            <input
              id="driver_first_name"
              name="driver_first_name"
              type="text"
              placeholder={t.registerForm.driverFirstNamePlaceholder}
              className={driverInputClass}
            />
          </div>
          <div>
            <label htmlFor="driver_last_name" className={driverLabelClass}>
              {t.registerForm.driverLastName}
            </label>
            <input
              id="driver_last_name"
              name="driver_last_name"
              type="text"
              placeholder={t.registerForm.driverLastNamePlaceholder}
              className={driverInputClass}
            />
          </div>
          <div>
            <label htmlFor="driver_birth_date" className={driverLabelClass}>
              {t.registerForm.driverBirthDate}
            </label>
            <input
              id="driver_birth_date"
              name="driver_birth_date"
              type="date"
              className={driverInputClass}
            />
          </div>
          <div>
            <label htmlFor="driver_license_country" className={driverLabelClass}>
              {t.registerForm.driverLicenseCountry}
            </label>
            <input
              id="driver_license_country"
              name="driver_license_country"
              type="text"
              maxLength={2}
              placeholder={t.registerForm.driverLicenseCountryPlaceholder}
              className={`${driverInputClass} uppercase`}
            />
          </div>
          <div>
            <label htmlFor="driver_license_issue_date" className={driverLabelClass}>
              {t.registerForm.driverLicenseIssueDate}
            </label>
            <input
              id="driver_license_issue_date"
              name="driver_license_issue_date"
              type="date"
              className={driverInputClass}
            />
          </div>
          <div>
            <label htmlFor="driver_license_class" className={driverLabelClass}>
              {t.registerForm.driverLicenseClass}
            </label>
            <input
              id="driver_license_class"
              name="driver_license_class"
              type="text"
              placeholder={t.registerForm.driverLicenseClassPlaceholder}
              className={driverInputClass}
            />
          </div>
        </div>
      </section>

      <p className="text-xs text-muted">{t.registerForm.note}</p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 focus:ring-offset-card disabled:opacity-50"
      >
        {pending ? t.registerForm.pending : t.registerForm.submit}
      </button>
    </form>
  );
}

