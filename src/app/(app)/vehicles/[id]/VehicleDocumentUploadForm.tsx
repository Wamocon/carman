"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createVehicleDocumentRecord } from "./actions";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const DOCUMENT_TYPE_OPTIONS = [
  { value: "registration", label: "Zulassungsbescheinigung" },
  { value: "insurance", label: "Versicherungspolice" },
  { value: "inspection", label: "TÜV-Bericht" },
  { value: "other", label: "Sonstiges" },
];

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function VehicleDocumentUploadForm({ vehicleId }: { vehicleId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("registration");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleUpload = () => {
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Bitte eine Datei auswählen.");
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Nur PDF, PNG, JPG und WEBP sind erlaubt.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Datei ist zu groß (max. 10 MB).");
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

      const fileName = sanitizeFileName(file.name);
      const uniqueName = `${crypto.randomUUID()}-${fileName}`;
      const storagePath = `${user.id}/${vehicleId}/${uniqueName}`;

      const uploadResult = await supabase.storage
        .from("vehicle-documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadResult.error) {
        setError("Datei konnte nicht hochgeladen werden.");
        return;
      }

      const payload = new FormData();
      payload.append("vehicle_id", vehicleId);
      payload.append("storage_path", storagePath);
      payload.append("file_name", file.name);
      payload.append("mime_type", file.type);
      payload.append("file_size_bytes", String(file.size));
      payload.append("document_type", documentType);
      payload.append("caption", caption);

      const result = await createVehicleDocumentRecord(payload);
      if (result.error) {
        await supabase.storage.from("vehicle-documents").remove([storagePath]);
        setError(result.error);
        return;
      }

      setSuccess("Dokument wurde gespeichert.");
      setFile(null);
      setCaption("");
      setDocumentType("registration");
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="vehicle_doc_file" className="block text-sm font-medium text-foreground">
            Datei auswählen
          </label>
          <input
            id="vehicle_doc_file"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label htmlFor="vehicle_doc_camera" className="block text-sm font-medium text-foreground">
            Foto aufnehmen
          </label>
          <input
            id="vehicle_doc_camera"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture="environment"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>
      <p className="text-xs text-muted">PDF, PNG, JPG, WEBP. Max. 10 MB.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="vehicle_doc_type" className="block text-sm font-medium text-foreground">
            Dokumenttyp
          </label>
          <select
            id="vehicle_doc_type"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
          >
            {DOCUMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vehicle_doc_caption" className="block text-sm font-medium text-foreground">
            Beschreibung (optional)
          </label>
          <input
            id="vehicle_doc_caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-xs text-muted">
        Automatische Texterkennung (OCR) wird in einem zukünftigen Update verfügbar sein und
        kann Fahrzeugdaten dann automatisch aus den Papieren übernehmen.
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <button
        type="button"
        onClick={handleUpload}
        disabled={pending}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird hochgeladen..." : "Dokument speichern"}
      </button>
    </div>
  );
}
