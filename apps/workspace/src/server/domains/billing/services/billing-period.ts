export const BILLING_PERIOD_DAYS = 30;

export function nextBillingPeriod(now: number, currentPeriodEndAt?: number, periodDays = BILLING_PERIOD_DAYS) {
  const currentEnd = currentPeriodEndAt ?? 0;
  const currentPeriodStartAt = Math.max(now, currentEnd);
  return {
    currentPeriodStartAt,
    currentPeriodEndAt: currentPeriodStartAt + periodDays * 24 * 60 * 60 * 1000,
  };
}
