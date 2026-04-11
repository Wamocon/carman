"use client";

import { useState, useTransition } from "react";
import { deleteCostEntry } from "./actions";

export function DeleteCostButton({ costEntryId }: { costEntryId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10"
      >
        Eintrag löschen
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-danger font-medium">
        Wirklich löschen? Alle Daten gehen unwiderruflich verloren.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(() => deleteCostEntry(costEntryId));
        }}
        className="rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Wird gelöscht..." : "Bestätigen"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setConfirming(false)}
        className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
      >
        Abbrechen
      </button>
    </div>
  );
}
