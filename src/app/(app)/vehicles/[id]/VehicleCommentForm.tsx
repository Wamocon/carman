"use client";

import { useActionState } from "react";
import { addVehicleComment } from "./actions";

export function VehicleCommentForm({ vehicleId }: { vehicleId: string }) {
  const [state, formAction, pending] = useActionState(addVehicleComment, {
    error: null as string | null,
    success: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="vehicle_id" value={vehicleId} />

      <div>
        <label htmlFor="vehicle_comment_body" className="block text-sm font-medium text-foreground">
          Neuer Kommentar
        </label>
        <textarea
          id="vehicle_comment_body"
          name="body"
          rows={3}
          required
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
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
