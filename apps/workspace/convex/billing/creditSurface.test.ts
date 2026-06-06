import { describe, expect, it } from "vitest";
import {
  applyCreditUsageToBalance,
  calculateAgentRunCredits,
  creditUsageSummary,
  includedCreditsForBillingPlan,
  type StoredCreditBalance,
} from "./creditSurface";

function balance(input: Partial<StoredCreditBalance>): StoredCreditBalance {
  return {
    _id: "balance_1",
    organizationId: "org_1",
    planId: "saudi_monthly",
    subscriptionCreditsGranted: 0,
    subscriptionCreditsUsed: 0,
    addOnCreditsGranted: 0,
    addOnCreditsUsed: 0,
    updatedAt: 1,
    ...input,
  };
}

describe("billing credit surface", () => {
  it("maps legacy billing plans through subscription entitlements", () => {
    expect(includedCreditsForBillingPlan("saudi_monthly")).toBe(0);
    expect(includedCreditsForBillingPlan("saudi_yearly")).toBe(0);
  });

  it("builds zero-safe usage summaries when no balance exists", () => {
    expect(creditUsageSummary({ fallbackSubscriptionCreditsGranted: 0 })).toEqual({
      subscriptionCreditsGranted: 0,
      subscriptionCreditsUsed: 0,
      subscriptionCreditsRemaining: 0,
      addOnCreditsGranted: 0,
      addOnCreditsUsed: 0,
      addOnCreditsRemaining: 0,
      currentPeriodStartAt: undefined,
      currentPeriodEndAt: undefined,
    });
  });

  it("spends subscription credits before add-on credits", () => {
    expect(applyCreditUsageToBalance({
      balance: balance({
        subscriptionCreditsGranted: 100,
        subscriptionCreditsUsed: 80,
        addOnCreditsGranted: 50,
        addOnCreditsUsed: 10,
      }),
      requestedCredits: 35,
    })).toMatchObject({
      allowed: true,
      subscriptionCreditsUsed: 20,
      addOnCreditsUsed: 15,
      subscriptionCredits: 0,
      addOnCredits: 25,
    });
  });

  it("rejects usage that would make the balance negative", () => {
    expect(applyCreditUsageToBalance({
      balance: balance({ subscriptionCreditsGranted: 3, addOnCreditsGranted: 2 }),
      requestedCredits: 6,
    })).toMatchObject({
      allowed: false,
      subscriptionCreditsUsed: 0,
      addOnCreditsUsed: 0,
      reason: "AI credit balance is exhausted.",
    });
  });

  it("uses one credit when provider token usage is missing", () => {
    expect(calculateAgentRunCredits({ modelId: "openai/gpt-5" })).toBe(1);
    expect(calculateAgentRunCredits({
      modelId: "openai/gpt-5",
      promptTokens: 1000,
      completionTokens: 100,
      toolCallCount: 1,
    })).toBeGreaterThan(1);
  });
});
