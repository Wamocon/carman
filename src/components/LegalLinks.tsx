import { getDictionary } from "@/lib/i18n";
import { LEGAL_LINKS } from "@/lib/legal";
import type { Locale } from "@/lib/preferences";

export function LegalLinks({
  locale,
  className,
  linkClassName,
}: {
  locale: Locale;
  className?: string;
  linkClassName?: string;
}) {
  const t = getDictionary(locale);

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      {LEGAL_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={
            linkClassName ??
            "rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-foreground/5 hover:text-foreground"
          }
        >
          {t.common[link.labelKey]}
        </a>
      ))}
    </div>
  );
}