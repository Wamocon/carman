"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCostInvoiceRecord } from "./actions";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function InvoiceUploadForm({ costEntryId }: { costEntryId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [note, setNote] = useState("");
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
      const storagePath = `${user.id}/${costEntryId}/${uniqueName}`;

      const uploadResult = await supabase.storage
        .from("cost-invoices")
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
      payload.append("cost_entry_id", costEntryId);
      payload.append("storage_path", storagePath);
      payload.append("file_name", file.name);
      payload.append("mime_type", file.type);
      payload.append("file_size_bytes", String(file.size));
      payload.append("invoice_number", invoiceNumber);
      payload.append("invoice_date", invoiceDate);
      payload.append("note", note);

      const result = await createCostInvoiceRecord(payload);
      if (result.error) {
        await supabase.storage.from("cost-invoices").remove([storagePath]);
        setError(result.error);
        return;
      }

      setSuccess("Rechnung wurde hochgeladen und dokumentiert.");
      setFile(null);
      setInvoiceNumber("");
      setInvoiceDate("");
      setNote("");
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="invoice_file" className="block text-sm font-medium text-foreground">
            Datei auswählen
          </label>
          <input
            id="invoice_file"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
          <p className="mt-1 text-xs text-muted">PDF, PNG, JPG, WEBP. Max. 10 MB.</p>
        </div>
        <div>
          <label htmlFor="invoice_camera" className="block text-sm font-medium text-foreground">
            Foto aufnehmen
          </label>
          <input
            id="invoice_camera"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture="environment"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
          <p className="mt-1 text-xs text-muted">Direkt über die Kamera fotografieren.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="invoice_number" className="block text-sm font-medium text-foreground">
            Rechnungsnummer (optional)
          </label>
          <input
            id="invoice_number"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label htmlFor="invoice_date" className="block text-sm font-medium text-foreground">
            Rechnungsdatum (optional)
          </label>
          <input
            id="invoice_date"
            type="date"
            value={invoiceDate}
            onChange={(event) => setInvoiceDate(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>

      <div>
        <label htmlFor="invoice_note" className="block text-sm font-medium text-foreground">
          Notiz zur Rechnung (optional)
        </label>
        <textarea
          id="invoice_note"
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-1 block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <button
        type="button"
        onClick={handleUpload}
        disabled={pending}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Wird hochgeladen..." : "Rechnung hochladen"}
      </button>
    </div>
  );
}
