"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export function SettingsForm({ displayName }: { displayName: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Profil aktualisiert.
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-foreground">
          Anzeigename
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={displayName}
          className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Wird gespeichert…" : "Speichern"}
      </button>
    </form>
  );
}
