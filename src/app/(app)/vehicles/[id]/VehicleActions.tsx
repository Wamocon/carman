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
            className="rounded-xl bg-danger px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {deleting ? "Wird gelöscht..." : "Bestätigen"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
          >
            Abbrechen
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10"
        >
          Fahrzeug löschen
        </button>
      )}
    </div>
  );
}
