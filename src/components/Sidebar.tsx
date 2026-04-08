"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserProfile } from "@/types/domain";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/vehicles", label: "Fahrzeuge", icon: "🚗" },
  { href: "/costs", label: "Kosten", icon: "💰" },
  { href: "/reminders", label: "Erinnerungen", icon: "🔔" },
] as const;

export function Sidebar({
  profile,
  signOutAction,
}: {
  profile: UserProfile;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-foreground/10 bg-background px-4 py-3 md:hidden">
        <span className="text-sm font-bold">Smart Car Manager</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-1 text-foreground/60 hover:text-foreground"
          aria-label="Menü öffnen"
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-foreground/10 bg-background transition-transform md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-foreground/10 px-4 py-4">
          <h2 className="text-sm font-bold">Smart Car Manager</h2>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-foreground/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">
                {profile.display_name ?? profile.email}
              </p>
              <p className="truncate text-xs text-foreground/50">{profile.email}</p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                profile.subscription_tier === "pro"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {profile.subscription_tier === "pro" ? "Pro" : "Free"}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-md border border-foreground/20 px-3 py-1.5 text-center text-xs font-medium text-foreground/70 hover:bg-foreground/5"
            >
              Einstellungen
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-foreground/20 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
