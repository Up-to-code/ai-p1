import { describe, expect, it } from "vitest";
import { billingWindow, creditLedgerProjection, meterLimit, nextUsageMeterState, usageProjection } from "./usageSurface";

const noAi = {
  aiAccess: false,
  includedCredits: 0,
  includedCreditCards: 0,
  appAccessLevel: "limited" as const,
  apiKeyQuota: 1,
  agentLinkQuota: 1,
  supportLevel: "standard" as const,
};

const withAi = {
  ...noAi,
  aiAccess: true,
  includedCredits: 100,
  appAccessLevel: "standard" as const,
};

describe("billing usage surface", () => {
  it("uses an active subscription billing window when present", () => {
    expect(billingWindow({ now: 50, currentPeriodStartAt: 10, currentPeriodEndAt: 100 })).toEqual({
      windowStartedAt: 10,
      windowEndsAt: 100,
    });
  });

  it("derives meter limits from entitlements", () => {
    expect(meterLimit(noAi, "ai_chat")).toBe(0);
    expect(meterLimit(withAi, "ai_chat")).toBe(100);
    expect(meterLimit(withAi, "app_access")).toBe(25);
  });

  it("blocks usage when no entitlement or no credits remain", () => {
    expect(usageProjection({ meter: "ai_chat", entitlements: noAi, existing: null })).toMatchObject({
      allowed: false,
      limit: 0,
    });
    expect(usageProjection({
      meter: "ai_chat",
      entitlements: withAi,
      existing: {
        organizationId: "org_1",
        meter: "ai_chat",
        windowStartedAt: 1,
        windowEndsAt: 2,
        used: 95,
        limit: 100,
        updatedAt: 1,
      },
      requested: 10,
    })).toMatchObject({
      allowed: false,
      remaining: 5,
    });
  });

  it("spends subscription credits before add-on credits", () => {
    const projection = creditLedgerProjection({
      meter: "ai_chat",
      entitlements: withAi,
      existing: {
        organizationId: "org_1",
        meter: "ai_chat",
        windowStartedAt: 1,
        windowEndsAt: 2,
        used: 95,
        limit: 100,
        addOnUsed: 3,
        addOnLimit: 20,
        updatedAt: 1,
      },
      requested: 10,
    });

    expect(projection).toMatchObject({
      allowed: true,
      subscriptionRemaining: 5,
      addOnRemaining: 17,
      subscriptionCreditsUsed: 5,
      addOnCreditsUsed: 5,
    });
    expect(nextUsageMeterState({
      projection,
      existing: {
        organizationId: "org_1",
        meter: "ai_chat",
        windowStartedAt: 1,
        windowEndsAt: 2,
        used: 95,
        limit: 100,
        addOnUsed: 3,
        addOnLimit: 20,
        updatedAt: 1,
      },
      requested: 10,
    })).toEqual({
      used: 100,
      limit: 100,
      addOnUsed: 8,
      addOnLimit: 20,
    });
  });
});
