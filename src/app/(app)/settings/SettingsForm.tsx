"use client";

import { useActionState } from "react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";
import { updateProfile } from "./actions";

export function SettingsForm({
  displayName,
  locale,
}: {
  displayName: string;
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
          defaultValue={displayName}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

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

