import { describe, expect, it } from "vitest";
import { nextBillingPeriod } from "./billing-period";

describe("billing period extension", () => {
  it("starts now when no active period exists", () => {
    expect(nextBillingPeriod(1_000)).toEqual({
      currentPeriodStartAt: 1_000,
      currentPeriodEndAt: 1_000 + 30 * 24 * 60 * 60 * 1000,
    });
  });

  it("extends from current period end when subscription is already active", () => {
    expect(nextBillingPeriod(1_000, 5_000)).toEqual({
      currentPeriodStartAt: 5_000,
      currentPeriodEndAt: 5_000 + 30 * 24 * 60 * 60 * 1000,
    });
  });
});
