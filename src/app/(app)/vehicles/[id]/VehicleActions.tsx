"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVehicle, sellVehicle } from "./actions";
import type { VehicleStatus } from "@/types/domain";

type SaleActionState = {
  error: string | null;
  success: string | null;
  saleCostEntryId: string | null;
};

const INITIAL_SALE_STATE: SaleActionState = {
  error: null,
  success: null,
  saleCostEntryId: null,
};

const inputClass =
  "mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

export function VehicleActions({
  vehicleId,
  vehicleStatus,
}: {
  vehicleId: string;
  vehicleStatus: VehicleStatus;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [saleState, saleAction, salePending] = useActionState<SaleActionState, FormData>(
    sellVehicle,
    INITIAL_SALE_STATE,
  );

  useEffect(() => {
    if (!saleState.success) return;
    dialogRef.current?.close();
    router.refresh();
  }, [router, saleState.success]);

  function openSellModal() {
    setConfirmStep(false);
    dialogRef.current?.showModal();
  }

  function closeSellModal() {
    dialogRef.current?.close();
    setConfirmStep(false);
  }

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
    <div className="space-y-3">
      {saleState.success ? (
        <div className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
          {saleState.success}{" "}
          {saleState.saleCostEntryId ? (
            <Link href={`/costs/${saleState.saleCostEntryId}`} className="font-medium underline">
              Verkaufseintrag öffnen
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {vehicleStatus === "owned" && !saleState.success ? (
          <button
            onClick={openSellModal}
            className="rounded-xl border border-amber-300/50 bg-amber-100/70 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            Fahrzeug verkaufen
          </button>
        ) : null}

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

      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-lg rounded-2xl border border-border bg-background p-0 shadow-xl backdrop:bg-black/50"
        onClose={() => setConfirmStep(false)}
      >
        <form action={saleAction} className="p-5 sm:p-6">
          <input type="hidden" name="vehicle_id" value={vehicleId} />

          {/* Form fields — always in DOM so formData is populated; hidden during confirm step */}
          <div className={confirmStep ? "hidden" : "space-y-4"}>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Fahrzeug verkaufen</h3>
              <p className="mt-1 text-sm text-muted">
                Der Verkauf wird als Erlös in den Kosten erfasst und das Fahrzeug danach auf
                verkauft gesetzt.
              </p>
            </div>

            {saleState.error ? (
              <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                {saleState.error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sale_price" className="block text-sm font-medium text-foreground">
                  Verkaufspreis (EUR)
                </label>
                <input
                  id="sale_price"
                  name="sale_price"
                  type="number"
                  min={0.01}
                  max={999999.99}
                  step="0.01"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="sale_date" className="block text-sm font-medium text-foreground">
                  Verkaufsdatum
                </label>
                <input
                  id="sale_date"
                  name="sale_date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground">
                Notiz (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                className={inputClass}
              />
            </div>

            <details className="rounded-xl border border-border/70 bg-card/50 p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Verkaufsbeleg (optional)
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor="invoice_file" className="block text-sm font-medium text-foreground">
                    Datei
                  </label>
                  <input
                    id="invoice_file"
                    name="invoice_file"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="invoice_number" className="block text-sm font-medium text-foreground">
                      Rechnungsnummer
                    </label>
                    <input id="invoice_number" name="invoice_number" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="invoice_date" className="block text-sm font-medium text-foreground">
                      Rechnungsdatum
                    </label>
                    <input id="invoice_date" name="invoice_date" type="date" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="invoice_note" className="block text-sm font-medium text-foreground">
                    Hinweis zum Beleg
                  </label>
                  <textarea id="invoice_note" name="invoice_note" rows={2} className={inputClass} />
                </div>
              </div>
            </details>

            <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={closeSellModal}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => setConfirmStep(true)}
                className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Weiter
              </button>
            </div>
          </div>

          {/* Confirmation step — shown on top of hidden fields */}
          {confirmStep ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-300/40 bg-amber-50/80 p-5 text-center dark:border-amber-500/30 dark:bg-amber-950/30">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-200/80 text-xl font-bold text-amber-700 dark:bg-amber-800/50 dark:text-amber-300">
                  !
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  Fahrzeug wirklich verkaufen?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Das Fahrzeug wird als verkauft markiert und erscheint nicht mehr in globalen
                  Übersichten. Dieser Vorgang kann nicht einfach rückgängig gemacht werden.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmStep(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={salePending}
                  className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {salePending ? "Wird verkauft..." : "Ja, Fahrzeug verkaufen"}
                </button>
              </div>
            </div>
          ) : null}
        </form>
      </dialog>
    </div>
  );
}
