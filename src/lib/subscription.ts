// ---------------------------------------------------------------------------
// CarMan — Subscription Plans & Helpers
// ---------------------------------------------------------------------------

import type { SubscriptionTier } from "@/types/domain";

export const PLANS = {
  free: {
    id: "free" as const,
    vehicles: 1,
    csvExport: false,
    allThemes: false,
    aiFeatures: false,
    prioritySupport: false,
  },
  pro: {
    id: "pro" as const,
    vehicles: Infinity,
    csvExport: true,
    allThemes: true,
    aiFeatures: true,
    prioritySupport: true,
  },
} satisfies Record<SubscriptionTier, object>;

export const PRICING = {
  monthly: { amount: 4.99, interval: "month" as const },
  yearly: { amount: 39.99, interval: "year" as const, monthlyEquivalent: 3.33, savingsPercent: 33 },
} as const;

export type BillingInterval = "month" | "year";

export function getPlanFeatures(tier: SubscriptionTier) {
  return PLANS[tier];
}
