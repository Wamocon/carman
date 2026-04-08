"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createVehicleImageRecord } from "./actions";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 12 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function VehicleImageUploadForm({ vehicleId }: { vehicleId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleUpload = () => {
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Bitte ein Bild auswählen.");
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Erlaubte Formate: PNG, JPG, WEBP, GIF.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("Bild ist zu groß (max. 12 MB).");
      return;
    }

    if (!rightsConfirmed) {
      setError("Bitte bestätige, dass du die Nutzungsrechte für das Bild hast.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Nicht angemeldet.");
        return;
      }

      const uniqueName = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const storagePath = `${user.id}/${vehicleId}/${uniqueName}`;

      const uploadResult = await supabase.storage
        .from("vehicle-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadResult.error) {
        setError("Bild konnte nicht hochgeladen werden.");
        return;
      }

      const metadata = new FormData();
      metadata.append("vehicle_id", vehicleId);
      metadata.append("storage_path", storagePath);
      metadata.append("file_name", file.name);
      metadata.append("mime_type", file.type);
      metadata.append("file_size_bytes", String(file.size));
      metadata.append("caption", caption);
      metadata.append("rights_confirmed", "true");

      const result = await createVehicleImageRecord(metadata);
      if (result.error) {
        await supabase.storage.from("vehicle-images").remove([storagePath]);
        setError(result.error);
        return;
      }

      setSuccess("Bild wurde gespeichert.");
      setFile(null);
      setCaption("");
      setRightsConfirmed(false);
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="vehicle_image_upload" className="block text-sm font-medium text-foreground">
          Fahrzeugbild hochladen
        </label>
        <input
          id="vehicle_image_upload"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div>
        <label htmlFor="vehicle_image_caption" className="block text-sm font-medium text-foreground">
          Bildbeschreibung (optional)
        </label>
        <input
          id="vehicle_image_caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
        />
      </div>

      <label className="flex items-start gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={rightsConfirmed}
          onChange={(event) => setRightsConfirmed(event.target.checked)}
          className="mt-0.5"
        />
        <span>
          Ich bestätige, dass ich das Bild selbst erstellt habe oder über die nötigen Nutzungsrechte verfüge.
        </span>
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <button
        type="button"
        onClick={handleUpload}
        disabled={pending}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird hochgeladen..." : "Bild speichern"}
      </button>
    </div>
  );
}
