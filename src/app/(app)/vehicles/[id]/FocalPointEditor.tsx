"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateImageFocalPoint } from "./sharing-actions";

const PREVIEW_RATIOS = [
  { label: "Karte (16:9)", w: 160, h: 90 },
  { label: "Quadrat (1:1)", w: 100, h: 100 },
  { label: "Hochformat (3:4)", w: 90, h: 120 },
  { label: "Banner (21:9)", w: 210, h: 90 },
] as const;

export function FocalPointEditor({
  imageId,
  signedUrl,
  initialX,
  initialY,
}: {
  imageId: string;
  signedUrl: string;
  initialX: number;
  initialY: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [focalX, setFocalX] = useState(initialX);
  const [focalY, setFocalY] = useState(initialY);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const updateFocal = useCallback((clientX: number, clientY: number) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setFocalX(x);
    setFocalY(y);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFocal(e.clientX, e.clientY);
    },
    [updateFocal],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updateFocal(e.clientX, e.clientY);
    },
    [isDragging, updateFocal],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      await updateImageFocalPoint(imageId, focalX, focalY);
      router.refresh();
    });
  };

  const hasChanged =
    Math.abs(focalX - initialX) > 0.005 || Math.abs(focalY - initialY) > 0.005;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">
          Fokuspunkt setzen
        </p>
        <p className="mb-3 text-sm text-muted">
          Klicke oder ziehe den Punkt auf der Stelle, die in allen Ansichten sichtbar bleiben soll.
        </p>
      </div>

      {/* Main image with draggable focal point */}
      <div
        ref={imageRef}
        className="relative cursor-crosshair select-none overflow-hidden rounded-xl border border-border/70"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signedUrl}
          alt="Fokuspunkt setzen"
          className="w-full pointer-events-none"
          draggable={false}
        />
        {/* Focal point indicator */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${focalX * 100}%`, top: `${focalY * 100}%` }}
        >
          <div className="relative">
            {/* Crosshair */}
            <div className="absolute -left-4 top-1/2 h-px w-9 -translate-y-1/2 bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute left-1/2 -top-4 h-9 w-px -translate-x-1/2 bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
            {/* Center dot */}
            <div className="h-4 w-4 rounded-full border-2 border-white bg-brand shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
      </div>

      {/* Coordinates display */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          X: {(focalX * 100).toFixed(0)}% · Y: {(focalY * 100).toFixed(0)}%
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !hasChanged}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
        >
          {isPending ? "Wird gespeichert..." : "Fokuspunkt speichern"}
        </button>
      </div>

      {/* Live previews at different aspect ratios */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">
          Vorschau in verschiedenen Formaten
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_RATIOS.map((ratio) => (
            <div key={ratio.label}>
              <p className="mb-1 text-[11px] font-medium text-muted">{ratio.label}</p>
              <div
                className="overflow-hidden rounded-lg border border-border/70"
                style={{
                  width: "100%",
                  aspectRatio: `${ratio.w} / ${ratio.h}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={signedUrl}
                  alt={`Vorschau ${ratio.label}`}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${focalX * 100}% ${focalY * 100}%`,
                  }}
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
