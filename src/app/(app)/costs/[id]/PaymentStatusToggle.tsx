"use client";

import { useTransition } from "react";
import { togglePaymentStatus } from "./actions";
import type { PaymentStatus } from "@/types/domain";

export function PaymentStatusToggle({
  costEntryId,
  currentStatus,
}: {
  costEntryId: string;
  currentStatus: PaymentStatus;
}) {
  const [pending, startTransition] = useTransition();
  const isPaid = currentStatus === "paid";
  const newStatus: PaymentStatus = isPaid ? "open" : "paid";

  const handleToggle = () => {
    startTransition(async () => {
      await togglePaymentStatus(costEntryId, newStatus);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          isPaid
            ? "bg-success/15 text-success"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isPaid ? "Bezahlt" : "Offen"}
      </span>
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5 disabled:opacity-50"
      >
        {pending
          ? "Wird geändert..."
          : isPaid
            ? "Als offen markieren"
            : "Als bezahlt markieren"}
      </button>
    </div>
  );
}
