"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";
import { toggleSharingEnabled } from "./sharing-actions";

export function SharingSettingsCard({
  sharingEnabled,
  locale,
}: {
  sharingEnabled: boolean;
  locale: Locale;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = getDictionary(locale);
  const g = t.gallery;

  const handleToggle = () => {
    const next = !sharingEnabled;
    startTransition(async () => {
      await toggleSharingEnabled(next);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">{g.settingsTitle}</p>
            <p className="mt-1 text-sm text-muted">{g.settingsCopy}</p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 ${
              sharingEnabled ? "bg-brand" : "bg-foreground/20"
            }`}
            role="switch"
            aria-checked={sharingEnabled}
            aria-label={sharingEnabled ? g.settingsDisable : g.settingsEnable}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                sharingEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          {sharingEnabled ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-success" />
              {g.settingsEnabled}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-foreground/30" />
              {g.settingsDisabledLabel}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
