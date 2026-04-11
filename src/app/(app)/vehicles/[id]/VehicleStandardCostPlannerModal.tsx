"use client";

import { useRef } from "react";
import { VehicleStandardCostPlanner } from "./VehicleStandardCostPlanner";
import type { FuelType } from "@/types/domain";

export function VehicleStandardCostPlannerModal({
  vehicleId,
  fuelType,
}: {
  vehicleId: string;
  fuelType: FuelType;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
      >
        Kostenrechner
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-2xl rounded-2xl border border-border bg-background p-0 shadow-xl backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Intelligenter Standard-Kostenrechner
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg p-1 text-muted hover:bg-foreground/5 hover:text-foreground"
            aria-label="Schließen"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <VehicleStandardCostPlanner vehicleId={vehicleId} fuelType={fuelType} asModal />
        </div>
      </dialog>
    </>
  );
}
