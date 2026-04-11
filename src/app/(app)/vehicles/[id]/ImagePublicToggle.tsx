"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleImagePublic, updateImageDescription } from "./sharing-actions";
import { deleteVehicleImage } from "./actions";

export function ImagePublicToggle({
  imageId,
  isPublic,
}: {
  imageId: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleImagePublic(imageId, !isPublic);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition disabled:opacity-50 ${
        isPublic
          ? "bg-success/15 text-success"
          : "bg-foreground/8 text-muted"
      }`}
    >
      {isPublic ? "Öffentlich" : "Privat"}
    </button>
  );
}

export function ImageDescriptionForm({
  imageId,
  currentDescription,
}: {
  imageId: string;
  currentDescription: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = (formData.get("description") as string) ?? "";
    startTransition(async () => {
      await updateImageDescription(imageId, description);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        name="description"
        defaultValue={currentDescription ?? ""}
        placeholder="Bildbeschreibung..."
        className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground placeholder:text-muted/60"
        maxLength={500}
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground hover:bg-foreground/5 disabled:opacity-50"
      >
        {isPending ? "..." : "Speichern"}
      </button>
    </form>
  );
}

export function DeleteImageButton({
  vehicleId,
  imageId,
}: {
  vehicleId: string;
  imageId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bild wirklich löschen?")) return;
    startTransition(async () => {
      await deleteVehicleImage(vehicleId, imageId);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-danger/30 px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
    >
      {isPending ? "..." : "Löschen"}
    </button>
  );
}
