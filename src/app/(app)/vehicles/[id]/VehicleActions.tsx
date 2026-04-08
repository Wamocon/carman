"use client";

import { useRouter } from "next/navigation";
import { deleteVehicle } from "./actions";
import { useState } from "react";

export function VehicleActions({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteVehicle(vehicleId);
    if (result?.error) {
      alert(result.error);
      setDeleting(false);
      setConfirming(false);
    } else {
      router.push("/vehicles");
    }
  }

  return (
    <div className="flex gap-2">
      {confirming ? (
        <>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Wird gelöscht…" : "Bestätigen"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-md border border-foreground/20 px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
          >
            Abbrechen
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Fahrzeug löschen
        </button>
      )}
    </div>
  );
}
