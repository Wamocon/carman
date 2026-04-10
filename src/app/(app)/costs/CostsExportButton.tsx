"use client";

import { useState } from "react";
import type { Vehicle } from "@/types/domain";
import { ExportModal } from "../export/ExportModal";

export function CostsExportButton({
  vehicles,
  vehicleId,
  category,
  startDate,
  endDate,
}: {
  vehicles: Pick<Vehicle, "id" | "make" | "model" | "status">[];
  vehicleId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong active:scale-[0.97]"
      >
        CSV exportieren
      </button>
      {open && (
        <ExportModal
          vehicles={vehicles}
          onClose={() => setOpen(false)}
          initialVehicleId={vehicleId}
          initialCategory={category}
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      )}
    </>
  );
}
