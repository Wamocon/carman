"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PreferenceSwitches } from "@/components/PreferenceSwitches";
import { getDictionary } from "@/lib/i18n";
import type { Locale, Theme } from "@/lib/preferences";
import type { UserProfile } from "@/types/domain";

const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", icon: "📊" },
  { href: "/vehicles", key: "vehicles", icon: "🚗" },
  { href: "/costs", key: "costs", icon: "💶" },
  { href: "/reminders", key: "reminders", icon: "🔔" },
  { href: "/export", key: "export", icon: "📄" },
  { href: "/settings", key: "settings", icon: "⚙️" },
] as const;

export function Sidebar({
  profile,
  signOutAction,
  locale,
  theme,
}: {
  profile: UserProfile;
  signOutAction: () => Promise<void>;
  locale: Locale;
  theme: Theme;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = getDictionary(locale);

  return (
    <>
      <header className="surface sticky top-0 z-30 mx-2 mt-2 flex items-center justify-between rounded-xl px-4 py-3 md:hidden">
        <div>
          <span className="text-xs uppercase tracking-[0.18em] text-muted">{t.appName}</span>
          <p className="text-sm font-semibold">{t.sidebar.cockpit}</p>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md border border-border/80 p-1 text-foreground/70 hover:text-foreground"
          aria-label={t.sidebar.menuOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`surface fixed inset-y-0 left-0 z-40 mt-0 flex w-72 flex-col rounded-none transition-transform md:static md:m-3 md:my-4 md:h-[calc(100vh-2rem)] md:translate-x-0 md:rounded-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-border/80 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{t.appName}</p>
          <h2 className="mt-1 text-lg font-semibold">{t.sidebar.subtitle}</h2>
          <p className="mt-1 text-xs text-muted">{t.sidebar.tagline}</p>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const navLabel = t.sidebar.nav[item.key].label;
            const navHint = t.sidebar.nav[item.key].hint;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-brand text-white shadow-md"
                    : "text-foreground/72 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{navLabel}</span>
                <span
                  className={`text-[11px] ${
                    active ? "text-white/85" : "text-muted group-hover:text-foreground/70"
                  }`}
                >
                  {navHint}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/80 p-4">
          <PreferenceSwitches locale={locale} theme={theme} compact />

          <div className="mb-2 flex items-center gap-2">
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">
                {profile.display_name ?? profile.email}
              </p>
              <p className="truncate text-xs text-muted">{profile.email}</p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                profile.subscription_tier === "pro"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {profile.subscription_tier === "pro" ? t.common.pro : t.common.free}
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs font-medium text-foreground/80 hover:bg-foreground/5"
            >
              {t.common.account}
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-danger/30 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10"
              >
                {t.common.signOut}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
