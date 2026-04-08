import type { SubscriptionTier } from "@/types/domain";
import type { Locale } from "@/lib/preferences";

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

function toIntlLocale(locale: Locale): string {
  return locale === "de" ? "de-DE" : "en-US";
}

export function formatCurrency(amount: number, locale: Locale = "de"): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: string, locale: Locale = "de"): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(
  n: number,
  decimals = 1,
  locale: Locale = "de",
): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

