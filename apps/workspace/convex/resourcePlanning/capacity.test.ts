import { describe, expect, it } from "vitest";
import { capacitySummary, overlapRatio, proratedMinutes } from "./capacity";

describe("resource capacity", () => {
  it("prorates periods at the requested interval boundaries", () => {
    expect(overlapRatio({ startAt: 0, endAt: 100 }, { startAt: 50, endAt: 150 })).toBe(0.5);
    expect(proratedMinutes([{ startAt: 0, endAt: 100, minutes: 600 }], 50, 100)).toBe(300);
  });

  it("subtracts approved leave before calculating allocation utilization", () => {
    expect(capacitySummary({
      startAt: 0, endAt: 100,
      capacity: [{ startAt: 0, endAt: 100, minutes: 2_400 }],
      leave: [{ startAt: 0, endAt: 25, minutes: 600 }],
      allocations: [{ startAt: 0, endAt: 100, minutes: 1_800 }],
    })).toEqual({ capacityMinutes: 2_400, leaveMinutes: 600, netCapacityMinutes: 1_800, allocatedMinutes: 1_800, availableMinutes: 0, utilizationPercent: 100 });
  });

  it("reports over-allocation explicitly", () => {
    expect(capacitySummary({ startAt: 0, endAt: 1, capacity: [{ startAt: 0, endAt: 1, minutes: 60 }], leave: [], allocations: [{ startAt: 0, endAt: 1, minutes: 90 }] }).availableMinutes).toBe(-30);
  });
});
