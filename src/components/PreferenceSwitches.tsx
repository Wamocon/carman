"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@/components/Icons";
import { LOCALE_COOKIE, THEME_COOKIE, type Locale, type Theme } from "@/lib/preferences";
import { getDictionary } from "@/lib/i18n";

function writePreferenceCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
}

export function PreferenceSwitches({
  locale,
  theme,
  compact = false,
}: {
  locale: Locale;
  theme: Theme;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = getDictionary(locale);

  const switchTheme = (nextTheme: Theme) => {
    writePreferenceCookie(THEME_COOKIE, nextTheme);
    applyTheme(nextTheme);
    startTransition(() => {
      router.refresh();
    });
  };

  const switchLocale = (nextLocale: Locale) => {
    writePreferenceCookie(LOCALE_COOKIE, nextLocale);
    document.documentElement.lang = nextLocale;
    startTransition(() => {
      router.refresh();
    });
  };

  const groupClassName = compact ? "grid gap-2" : "grid gap-3";

  return (
    <div className={groupClassName} aria-live="polite" aria-busy={isPending}>
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-[0.15em] text-foreground/70">{t.common.theme}</p>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-card/70 p-1">
          <button
            type="button"
            onClick={() => switchTheme("light")}
            aria-pressed={theme === "light"}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
              theme === "light"
                ? "bg-foreground/10 text-foreground"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            {t.common.light}
          </button>
          <button
            type="button"
            onClick={() => switchTheme("dark")}
            aria-pressed={theme === "dark"}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
              theme === "dark"
                ? "bg-foreground/10 text-foreground"
                : "text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            {t.common.dark}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-foreground/70" htmlFor="language-select">
          {t.common.language}
        </label>
        <div className="relative">
          <select
            id="language-select"
            value={locale}
            onChange={(e) => switchLocale(e.target.value as Locale)}
            className="w-full appearance-none rounded-lg border border-border bg-card/70 px-3 py-2 pr-8 text-xs font-medium text-foreground/80 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="de">{t.common.german}</option>
            <option value="en">{t.common.english}</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-foreground/50">
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}


