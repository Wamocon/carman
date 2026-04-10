"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DARK_THEMES,
  LIGHT_THEMES,
  LOCALE_COOKIE,
  THEME_COOKIE,
  getDefaultThemeForMode,
  getThemeMode,
  isDarkTheme,
  themeOptions,
  type Locale,
  type ThemeMode,
  type Theme,
} from "@/lib/preferences";
import { getDictionary } from "@/lib/i18n";

function writePreferenceCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", isDarkTheme(theme));
}

export function PreferenceSwitches({
  locale,
  theme,
  compact = false,
  compactTone = "inverse",
}: {
  locale: Locale;
  theme: Theme;
  compact?: boolean;
  compactTone?: "inverse" | "surface";
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
    startTransition(() => {
      router.refresh();
    });
  };

  const switchThemeMode = (nextMode: ThemeMode) => {
    switchTheme(getDefaultThemeForMode(nextMode));
  };

  const tTheme = t.themeOptions;
  const activeMode = getThemeMode(theme);
  const containerClassName = compact ? "grid gap-3" : "grid gap-5";
  const useInverseCompactTone = compact && compactTone === "inverse";
  const labelClassName = compact
    ? useInverseCompactTone
      ? "mb-2 text-[11px] uppercase tracking-[0.18em] text-white/82"
      : "mb-2 text-[11px] uppercase tracking-[0.18em] text-muted"
    : "mb-2 text-[11px] uppercase tracking-[0.18em] text-muted";
  const compactFrameClassName = useInverseCompactTone
    ? "grid grid-cols-2 gap-1 rounded-2xl border border-white/24 bg-slate-950/18 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md"
    : "grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card/75 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
  const modeFrameClassName = compact
    ? compactFrameClassName
    : "grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card/75 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
  const activeCompactClassName = useInverseCompactTone
    ? "bg-white text-slate-900 shadow-[0_10px_24px_-18px_rgba(255,255,255,0.85)]"
    : "bg-foreground text-background shadow-[0_12px_24px_-18px_rgba(16,24,32,0.7)]";
  const activeModeClassName = compact
    ? activeCompactClassName
    : "bg-foreground text-background shadow-[0_12px_24px_-18px_rgba(16,24,32,0.7)]";
  const inactiveCompactClassName = useInverseCompactTone
    ? "text-white/92 hover:bg-white/14"
    : "text-foreground/72 hover:bg-foreground/5";
  const inactiveModeClassName = compact
    ? inactiveCompactClassName
    : "text-foreground/72 hover:bg-foreground/5";
  const localeFrameClassName = compact
    ? compactFrameClassName
    : "grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card/75 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
  const activeLocaleClassName = compact
    ? activeCompactClassName
    : "bg-foreground text-background shadow-[0_12px_24px_-18px_rgba(16,24,32,0.7)]";
  const inactiveLocaleClassName = compact
    ? inactiveCompactClassName
    : "text-foreground/72 hover:bg-foreground/5";
  const fullThemeGridClassName = "grid gap-3 sm:grid-cols-2 xl:grid-cols-3";

  function renderThemeGroup(themeIds: readonly Theme[], title: string) {
    return (
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
        <div className={fullThemeGridClassName}>
          {themeIds.map((themeId) => {
            const themeOption = themeOptions[themeId];
            const selected = theme === themeId;

            return (
              <button
                key={themeId}
                type="button"
                onClick={() => switchTheme(themeId)}
                aria-pressed={selected}
                className={`group rounded-[1.35rem] border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                  selected
                    ? "border-brand/65 bg-card text-foreground shadow-[0_24px_50px_-36px_rgba(15,35,56,0.62)]"
                    : "border-border/80 bg-card/70 text-foreground/85 hover:border-brand/30"
                }`}
              >
                <div
                  className="relative h-24 overflow-hidden rounded-[1rem] border"
                  style={{
                    background: themeOption.previewBackground,
                    borderColor: themeOption.previewBorder,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 22px 36px -34px ${themeOption.previewAccent}`,
                  }}
                >
                  <span className="absolute left-3 top-3 h-px w-14 rounded-full bg-white/55" />
                  <span className="absolute right-3 top-3 h-6 w-16 rounded-md border border-white/35 bg-white/10 backdrop-blur-sm" />
                  <span
                    className="absolute bottom-3 left-3 right-3 h-8 rounded-xl"
                    style={{
                      border: `1px solid ${themeOption.previewBorder}`,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{tTheme[themeId].name}</p>
                    {selected ? (
                      <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                        {t.common.activeTheme}
                      </span>
                    ) : themeOption.category === "default" ? (
                      <span className="rounded-full bg-foreground/6 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        {t.common.defaultTheme}
                      </span>
                    ) : themeOption.category === "easterEgg" ? (
                      <span className="rounded-full bg-amber-500/14 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
                        {t.common.easterEgg}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{tTheme[themeId].description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName} aria-live="polite" aria-busy={isPending}>
      <div>
        <p className={labelClassName}>{t.common.theme}</p>
        {compact ? (
          <div className={modeFrameClassName}>
            {([
              ["light", t.common.light],
              ["dark", t.common.dark],
            ] as const).map(([modeId, label]) => (
              <button
                key={modeId}
                type="button"
                onClick={() => switchThemeMode(modeId)}
                aria-pressed={activeMode === modeId}
                className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeMode === modeId ? activeModeClassName : inactiveModeClassName
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {renderThemeGroup(DARK_THEMES, t.common.darkThemes)}
            {renderThemeGroup(LIGHT_THEMES, t.common.lightThemes)}
          </div>
        )}
      </div>

      <div>
        <p className={labelClassName}>{t.common.language}</p>
        <div className={localeFrameClassName}>
          {([
            ["de", t.common.german],
            ["en", t.common.english],
          ] as const).map(([localeId, label]) => (
            <button
              key={localeId}
              type="button"
              onClick={() => switchLocale(localeId)}
              aria-pressed={locale === localeId}
              className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                locale === localeId ? activeLocaleClassName : inactiveLocaleClassName
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


