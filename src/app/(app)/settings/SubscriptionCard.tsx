"use client";

import { useActionState, useState } from "react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/preferences";
import { PRICING } from "@/lib/subscription";
import type { SubscriptionTier } from "@/types/domain";
import { requestUpgrade } from "./actions";

export function SubscriptionCard({
  tier,
  locale,
}: {
  tier: SubscriptionTier;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");
  const [state, formAction, pending] = useActionState(requestUpgrade, {
    error: null,
    success: false,
  });

  const isPro = tier === "pro";

  const features = [
    { key: "vehicles", free: t.settingsPage.oneVehicle, pro: t.settingsPage.unlimited },
    { key: "csvExport", free: "—", pro: "✓" },
    { key: "allThemes", free: "3", pro: "✓" },
    { key: "aiFeatures", free: "—", pro: t.settingsPage.comingSoon },
    { key: "prioritySupport", free: "—", pro: "✓" },
  ] as const;

  const pricing = billingInterval === "year" ? PRICING.yearly : PRICING.monthly;

  return (
    <div className="space-y-5">
      {/* Current plan badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            isPro
              ? "bg-success/16 text-success"
              : "bg-foreground/8 text-muted"
          }`}
        >
          {isPro ? t.common.pro : t.common.free}
        </span>
        <span className="text-sm text-muted">{t.settingsPage.currentPlan}</span>
      </div>

      {/* Feature comparison */}
      <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
        <div className="grid grid-cols-3 border-b border-border/60 px-4 py-2.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{t.settingsPage.feature}</p>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted">{t.common.free}</p>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-brand">{t.common.pro}</p>
        </div>
        {features.map((f) => (
          <div key={f.key} className="grid grid-cols-3 border-b border-border/40 px-4 py-2.5 last:border-0">
            <p className="text-sm text-foreground">
              {t.settingsPage[f.key as keyof typeof t.settingsPage]}
            </p>
            <p className="text-center text-sm text-muted">{f.free}</p>
            <p className="text-center text-sm font-medium text-foreground">{f.pro}</p>
          </div>
        ))}
      </div>

      {/* Upgrade section for free users */}
      {!isPro && (
        <>
          {state.success ? (
            <div className="animate-fade-in rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success">
              <p className="font-medium">{t.settingsPage.upgradeRequested}</p>
              <p className="mt-1">{t.settingsPage.upgradeRequestedCopy}</p>
            </div>
          ) : (
            <>
              {state.error && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                  {state.error}
                </div>
              )}

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setBillingInterval("month")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    billingInterval === "month"
                      ? "bg-brand/15 text-brand"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t.settingsPage.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("year")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    billingInterval === "year"
                      ? "bg-brand/15 text-brand"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t.settingsPage.yearly}
                  <span className="ml-1.5 rounded-full bg-success/16 px-2 py-0.5 text-xs text-success">
                    −{PRICING.yearly.savingsPercent}%
                  </span>
                </button>
              </div>

              {/* Pricing card */}
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-5 text-center">
                <p className="text-3xl font-bold text-foreground">
                  €{pricing.amount.toFixed(2).replace(".", ",")}
                  <span className="text-base font-normal text-muted">
                    {" "}{billingInterval === "year" ? t.settingsPage.perYear : t.settingsPage.perMonth}
                  </span>
                </p>
                {billingInterval === "year" && (
                  <p className="mt-1 text-xs text-muted">
                    {t.settingsPage.equivalentMonthly
                      .replace("{amount}", `€${PRICING.yearly.monthlyEquivalent.toFixed(2).replace(".", ",")}`)}
                  </p>
                )}

                <form action={formAction} className="mt-4">
                  <input type="hidden" name="billing_interval" value={billingInterval} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
                  >
                    {pending ? "..." : t.settingsPage.upgradeNow}
                  </button>
                </form>
              </div>
            </>
          )}
        </>
      )}

      {isPro && (
        <p className="text-sm text-success">{t.settingsPage.alreadyPro}</p>
      )}
    </div>
  );
}
