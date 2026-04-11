"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateImageCaption,
  updateImageDescription,
  toggleImagePublic,
} from "../../sharing-actions";

export function OwnerImageMetaForm({
  imageId,
  currentCaption,
  currentDescription,
  isPublic,
}: {
  imageId: string;
  currentCaption: string | null;
  currentDescription: string | null;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [caption, setCaption] = useState(currentCaption ?? "");
  const [description, setDescription] = useState(currentDescription ?? "");

  const handleSaveCaption = () => {
    startTransition(async () => {
      await updateImageCaption(imageId, caption);
      router.refresh();
    });
  };

  const handleSaveDescription = () => {
    startTransition(async () => {
      await updateImageDescription(imageId, description);
      router.refresh();
    });
  };

  const handleTogglePublic = () => {
    startTransition(async () => {
      await toggleImagePublic(imageId, !isPublic);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Caption */}
      <div>
        <label htmlFor="caption" className="mb-1 block text-xs font-medium text-muted">
          Bildtitel
        </label>
        <div className="flex gap-2">
          <input
            id="caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="z. B. Front links bei Sonnenuntergang"
            maxLength={200}
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
          />
          <button
            type="button"
            onClick={handleSaveCaption}
            disabled={isPending || caption === (currentCaption ?? "")}
            className="shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 disabled:opacity-50"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1 block text-xs font-medium text-muted">
          Beschreibung (wird bei Veröffentlichung angezeigt)
        </label>
        <div className="flex gap-2">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Umfassende Beschreibung dieses Bildes..."
            maxLength={2000}
            rows={3}
            className="min-w-0 flex-1 resize-y rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/60"
          />
          <button
            type="button"
            onClick={handleSaveDescription}
            disabled={isPending || description === (currentDescription ?? "")}
            className="shrink-0 self-start rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 disabled:opacity-50"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* Public toggle */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Sichtbarkeit</p>
          <p className="mt-0.5 text-xs text-muted">
            {isPublic
              ? "Dieses Bild ist öffentlich sichtbar, wenn das Fahrzeug veröffentlicht ist."
              : "Dieses Bild ist nur für dich sichtbar."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleTogglePublic}
          disabled={isPending}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 ${
            isPublic ? "bg-brand" : "bg-foreground/20"
          }`}
          role="switch"
          aria-checked={isPublic}
          aria-label={isPublic ? "Auf privat setzen" : "Öffentlich machen"}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
              isPublic ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
