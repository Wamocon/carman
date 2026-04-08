"use client";

import { useActionState } from "react";
import { addCostComment } from "./actions";

export function CommentForm({ costEntryId }: { costEntryId: string }) {
  const [state, formAction, pending] = useActionState(addCostComment, {
    error: null as string | null,
    success: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="cost_entry_id" value={costEntryId} />

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-foreground">
          Neuer Kommentar
        </label>
        <textarea
          id="body"
          name="body"
          rows={3}
          required
          maxLength={3000}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird gespeichert..." : "Kommentar speichern"}
      </button>
    </form>
  );
}
