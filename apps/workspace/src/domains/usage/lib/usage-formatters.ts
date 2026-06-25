import type { BillingPlan } from "@/domains/billing/api/billing";
import { localeDateFormatter, localeNumberFormatter } from "@/lib/i18n/format";

export type UsageLocale = "en" | "ar";

export type UsagePlanIntervalLabels = {
  year: string;
  month: string;
  custom: string;
};

export function usageMoneyLabel(amount: number, currency: string, locale: UsageLocale) {
  return localeNumberFormatter(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function usageDateLabel(timestamp: number, locale: UsageLocale) {
  return localeDateFormatter(locale, { dateStyle: "medium" }).format(new Date(timestamp));
}

export function usagePlanPriceLabel(
  plan: BillingPlan,
  locale: UsageLocale,
  intervalLabels: UsagePlanIntervalLabels,
) {
  const interval = plan.periodDays >= 365 ? intervalLabels.year : intervalLabels.month;
  if (plan.amount === null) return intervalLabels.custom;
  return `${usageMoneyLabel(plan.amount, plan.currency, locale)} / ${interval}`;
}
