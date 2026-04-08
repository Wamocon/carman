import type { SubscriptionTier } from "@/types/domain";

const VEHICLE_LIMITS: Record<SubscriptionTier, number> = {
  free: 1,
  pro: Infinity,
};

export function canAddVehicle(
  tier: SubscriptionTier,
  currentCount: number,
): boolean {
  return currentCount < VEHICLE_LIMITS[tier];
}

export function isProFeature(tier: SubscriptionTier): boolean {
  return tier !== "pro";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(n: number, decimals = 1): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}
