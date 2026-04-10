import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";

export function ProUpgradeBanner({
  locale,
  context,
}: {
  locale: Locale;
  context?: string;
}) {
  const t = getDictionary(locale);

  return (
    <div className="animate-fade-in rounded-xl border border-brand/25 bg-brand/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            <span className="mr-2 inline-flex rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand">
              PRO
            </span>
            {t.common.proRequired}
          </p>
          <p className="mt-1 text-xs text-muted">
            {context ?? t.common.proRequiredCopy}
          </p>
        </div>
        <Link
          href="/settings#subscription"
          className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-strong"
        >
          {t.common.upgradeNow}
        </Link>
      </div>
    </div>
  );
}
