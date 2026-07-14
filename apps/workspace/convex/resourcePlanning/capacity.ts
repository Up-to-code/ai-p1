export type IntervalAmount = Readonly<{ startAt: number; endAt: number; minutes: number }>;

export function assertInterval(startAt: number, endAt: number) {
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt <= startAt) throw new Error("The end of a resource period must be after its start.");
}

export function overlapRatio(period: Pick<IntervalAmount, "startAt" | "endAt">, window: Pick<IntervalAmount, "startAt" | "endAt">) {
  const overlap = Math.max(0, Math.min(period.endAt, window.endAt) - Math.max(period.startAt, window.startAt));
  return overlap / (period.endAt - period.startAt);
}

export function proratedMinutes(periods: readonly IntervalAmount[], startAt: number, endAt: number) {
  assertInterval(startAt, endAt);
  const window = { startAt, endAt };
  return Math.round(periods.reduce((total, period) => {
    assertInterval(period.startAt, period.endAt);
    return total + period.minutes * overlapRatio(period, window);
  }, 0));
}

export function capacitySummary(input: {
  startAt: number;
  endAt: number;
  capacity: readonly IntervalAmount[];
  leave: readonly IntervalAmount[];
  allocations: readonly IntervalAmount[];
}) {
  const capacityMinutes = proratedMinutes(input.capacity, input.startAt, input.endAt);
  const leaveMinutes = proratedMinutes(input.leave, input.startAt, input.endAt);
  const allocatedMinutes = proratedMinutes(input.allocations, input.startAt, input.endAt);
  const netCapacityMinutes = Math.max(0, capacityMinutes - leaveMinutes);
  return {
    capacityMinutes,
    leaveMinutes,
    netCapacityMinutes,
    allocatedMinutes,
    availableMinutes: netCapacityMinutes - allocatedMinutes,
    utilizationPercent: netCapacityMinutes > 0 ? Math.round((allocatedMinutes / netCapacityMinutes) * 10_000) / 100 : 0,
  };
}
