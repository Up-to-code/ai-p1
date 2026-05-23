export const BILLING_PERIOD_DAYS = 30;

export function nextBillingPeriod(now: number, currentPeriodEndAt?: number) {
  const currentEnd = currentPeriodEndAt ?? 0;
  const currentPeriodStartAt = Math.max(now, currentEnd);
  return {
    currentPeriodStartAt,
    currentPeriodEndAt: currentPeriodStartAt + BILLING_PERIOD_DAYS * 24 * 60 * 60 * 1000,
  };
}
