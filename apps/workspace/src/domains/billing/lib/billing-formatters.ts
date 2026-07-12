import type { BillingPlan } from "../config/plans.config";
import { PLAN_CURRENCY, PRICE_PER_SEAT } from "../config/plans.config";
import { localeDateFormatter, localeNumberFormatter } from "@/lib/i18n/format";

export type BillingLocale = "en" | "ar";

export function billingDateLabel(
  value: number | undefined,
  locale: BillingLocale = "en",
  inactiveLabel = "Not active yet",
) {
  if (!value) return inactiveLabel;
  return localeDateFormatter(locale).format(new Date(value));
}

export function subscriptionTone(status?: string) {
  if (status === "active") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "past_due") return "danger" as const;
  return "neutral" as const;
}

export function billingPriceLabel(plan: BillingPlan, locale: BillingLocale) {
  if (plan.amount === null) return "Contact sales";
  return localeNumberFormatter(locale, {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 2,
  }).format(plan.amount);
}

export function seatTotalLabel(seats: number, locale: BillingLocale) {
  const total = Math.round(seats * (PRICE_PER_SEAT ?? 0) * 100) / 100;
  return localeNumberFormatter(locale, {
    style: "currency",
    currency: PLAN_CURRENCY,
    maximumFractionDigits: 2,
  }).format(total);
}

export function billingPricePerSeatLabel(locale: BillingLocale) {
  return localeNumberFormatter(locale, {
    style: "currency",
    currency: PLAN_CURRENCY,
    maximumFractionDigits: 2,
  }).format(PRICE_PER_SEAT ?? 0);
}
