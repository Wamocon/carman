"use client";

import { useState } from "react";
import { ExportModal } from "@/app/(app)/export/ExportModal";
import type { Vehicle } from "@/types/domain";

export function VehicleExportButton({
  vehicle,
}: {
  vehicle: Pick<Vehicle, "id" | "make" | "model" | "status">;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
      >
        CSV Export
      </button>

      {open ? (
        <ExportModal
          vehicles={[vehicle]}
          fixedVehicle={vehicle}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
