import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "./CommentForm";
import { InvoiceUploadForm } from "./InvoiceUploadForm";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CostEntry, CostComment, CostInvoice, Vehicle } from "@/types/domain";

const CATEGORY_LABELS: Record<string, string> = {
  fuel: "Tanken",
  maintenance: "Wartung",
  repair: "Reparatur",
  insurance: "Versicherung",
  tax: "Steuer",
  leasing: "Leasing",
  parking: "Parken",
  other: "Sonstiges",
};

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return {
    title: `Kostenposition ${id.slice(0, 8)} — CarMan`,
  };
}

export default async function CostDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: cost }, { data: comments }, { data: invoices }] = await Promise.all([
    supabase
      .from("cost_entries")
      .select("*, vehicles!inner(id, make, model, license_plate)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("cost_comments")
      .select("*")
      .eq("cost_entry_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("cost_invoices")
      .select("*")
      .eq("cost_entry_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!cost) {
    notFound();
  }

  const costEntry = cost as CostEntry & { vehicles: Pick<Vehicle, "id" | "make" | "model" | "license_plate"> };
  const allComments = (comments ?? []) as CostComment[];
  const allInvoices = (invoices ?? []) as CostInvoice[];

  const signedInvoiceLinks = await Promise.all(
    allInvoices.map(async (invoice) => {
      const { data } = await supabase.storage
        .from("cost-invoices")
        .createSignedUrl(invoice.storage_path, 60 * 30);

      return {
        invoice,
        signedUrl: data?.signedUrl ?? null,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/costs" className="text-sm text-muted hover:text-foreground">
              ← Zurück zu Kosten
            </Link>
            <h1 className="heading-display mt-2 text-3xl font-semibold text-foreground">Kostenposition: {costEntry.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {CATEGORY_LABELS[costEntry.category] ?? costEntry.category} · {costEntry.vehicles.make} {costEntry.vehicles.model} ({costEntry.vehicles.license_plate})
            </p>
          </div>
          <Link href={`/costs/new?vehicle_id=${costEntry.vehicle_id}&category=${costEntry.category}`} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong">
            Ähnlichen Eintrag erfassen
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Betrag</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(costEntry.amount)}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Datum</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatDate(costEntry.date)}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Kategorie</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{CATEGORY_LABELS[costEntry.category] ?? costEntry.category}</p>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Kilometerstand</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{costEntry.mileage ? `${costEntry.mileage.toLocaleString("de-DE")} km` : "-"}</p>
        </div>
      </section>

      {costEntry.notes ? (
        <section className="section-shell p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Notizen</h2>
          <p className="mt-2 text-sm text-foreground/90">{costEntry.notes}</p>
        </section>
      ) : null}

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Kommentare</h2>
        <CommentForm costEntryId={costEntry.id} />
        {allComments.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Kommentare vorhanden.</p>
        ) : (
          <ul className="space-y-3">
            {allComments.map((comment) => (
              <li key={comment.id} className="rounded-xl border border-border/70 bg-card/60 p-3">
                <p className="text-sm text-foreground">{comment.body}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(comment.created_at.slice(0, 10))}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section-shell space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Rechnungen</h2>
        <InvoiceUploadForm costEntryId={costEntry.id} />

        {signedInvoiceLinks.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Rechnungen hochgeladen.</p>
        ) : (
          <ul className="space-y-3">
            {signedInvoiceLinks.map(({ invoice, signedUrl }) => (
              <li key={invoice.id} className="rounded-xl border border-border/70 bg-card/60 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{invoice.file_name}</p>
                    <p className="text-xs text-muted">
                      {invoice.invoice_date ? `Rechnungsdatum: ${formatDate(invoice.invoice_date)} · ` : ""}
                      {invoice.invoice_number ? `Nr. ${invoice.invoice_number} · ` : ""}
                      {Math.round(invoice.file_size_bytes / 1024)} KB
                    </p>
                    {invoice.note ? <p className="mt-1 text-xs text-muted">{invoice.note}</p> : null}
                  </div>
                  {signedUrl ? (
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-foreground/5"
                    >
                      öffnen
                    </a>
                  ) : (
                    <span className="text-xs text-muted">Link nicht verfügbar</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
