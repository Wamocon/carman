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
