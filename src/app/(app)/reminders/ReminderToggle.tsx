"use client";

import { useTransition } from "react";
import { toggleReminder } from "./actions";

export function ReminderToggle({
  reminderId,
  isCompleted,
}: {
  reminderId: string;
  isCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleReminder(reminderId, !isCompleted);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
        isCompleted
          ? "border-green-500 bg-green-500 text-white"
          : "border-foreground/30 hover:border-blue-500"
      } ${isPending ? "opacity-50" : ""}`}
      aria-label={isCompleted ? "Als offen markieren" : "Als erledigt markieren"}
    >
      {isCompleted && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
