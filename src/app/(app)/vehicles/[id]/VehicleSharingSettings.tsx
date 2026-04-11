"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";
import {
  toggleVehiclePublished,
  updateVehicleSharingOptions,
} from "./sharing-actions";

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 ${
          checked ? "bg-brand" : "bg-foreground/20"
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function VehicleSharingSettings({
  vehicleId,
  isPublished,
  shareHeader,
  shareDetails,
  shareImages,
  locale,
}: {
  vehicleId: string;
  isPublished: boolean;
  shareHeader: boolean;
  shareDetails: boolean;
  shareImages: boolean;
  locale: Locale;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = getDictionary(locale);
  const g = t.gallery;

  const handlePublish = (next: boolean) => {
    startTransition(async () => {
      await toggleVehiclePublished(vehicleId, next);
      router.refresh();
    });
  };

  const handleOption = (key: "share_header" | "share_details" | "share_images", next: boolean) => {
    startTransition(async () => {
      await updateVehicleSharingOptions(vehicleId, { [key]: next });
      router.refresh();
    });
  };

  return (
    <div className="section-shell space-y-4 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">{g.sharingSettings}</h2>

      <Toggle
        checked={isPublished}
        onChange={handlePublish}
        label={isPublished ? g.published : g.publishVehicle}
        disabled={isPending}
      />

      {isPublished ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            {g.sharingSettings}
          </p>
          <Toggle
            checked={shareHeader}
            onChange={(v) => handleOption("share_header", v)}
            label={g.shareHeaderLabel}
            disabled={isPending}
          />
          <Toggle
            checked={shareDetails}
            onChange={(v) => handleOption("share_details", v)}
            label={g.shareDetailsLabel}
            disabled={isPending}
          />
          <Toggle
            checked={shareImages}
            onChange={(v) => handleOption("share_images", v)}
            label={g.shareImagesLabel}
            disabled={isPending}
          />
        </div>
      ) : null}
    </div>
  );
}
