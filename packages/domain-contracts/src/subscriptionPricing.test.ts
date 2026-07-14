import { describe, expect, it } from "vitest";
import {
  applyUsageToCreditBalance,
  calculateAiCredits,
  canAddCreditCardsToPlan,
  creditsForProviderCost,
  customCreditPurchase,
  decideEntitlement,
  getCreditPack,
  getGlobalPlan,
  getMarketPricing,
  includedCreditCardsForPlan,
  listAddOnCreditCards,
  resolveSubscriptionEntitlements,
  resolveOrganizationEntitlements,
} from "./subscriptionPricing";

describe("subscription pricing catalog", () => {
  it("keeps global plan entitlements currency-neutral", () => {
    expect(getGlobalPlan("better").entitlements).toMatchObject({
      aiAccess: true,
      includedCredits: 10_000,
      appAccessLevel: "standard",
    });
    expect(resolveSubscriptionEntitlements("good")).toMatchObject({
      aiAccess: true,
      includedCredits: 3_000,
      appAccessLevel: "limited",
    });
  });

  it("returns USD pricing for global plans", () => {
    expect(getMarketPricing({ planId: "good", cycle: "yearly" })).toMatchObject({
      amount: 70,
      currency: "USD",
      providerEligibility: ["dodo"],
    });
    expect(getMarketPricing({ planId: "better", cycle: "monthly" })).toMatchObject({
      amount: 19,
      currency: "USD",
      providerEligibility: ["dodo"],
    });
  });

  it("returns contact-sales pricing for custom plans", () => {
    expect(getMarketPricing({ planId: "custom", cycle: "yearly" })).toMatchObject({
      amount: null,
      checkoutMode: "contact_sales",
      publicFeatureFlags: { contactSales: true },
    });
  });

  it("prices durable AI credit cards at one thousand credits per dollar", () => {
    expect(getCreditPack({ packId: "growth" })).toMatchObject({
      credits: 15_000,
      amount: 15,
      rollover: "never_expires",
    });
    expect(customCreditPurchase(7)).toMatchObject({ credits: 7_000, amount: 7 });
    expect(() => customCreditPurchase(1_001)).toThrow(RangeError);
  });

  it("models included and add-on AI credit cards separately from plan price", () => {
    expect(includedCreditCardsForPlan("better")).toEqual({
      cards: 10,
      credits: 10_000,
      cardSize: 1_000,
    });
    expect(canAddCreditCardsToPlan("good")).toBe(true);
    expect(listAddOnCreditCards({ planId: "better" }).map((pack) => pack.id)).toEqual(["starter", "growth", "scale"]);
    expect(listAddOnCreditCards({ planId: "custom" })).toEqual([]);
    expect(listAddOnCreditCards({ planId: "free" })).toEqual([]);
  });

  it("falls back to Free outside active, paid, trial, or grace windows", () => {
    const active = resolveOrganizationEntitlements({ planId: "better", status: "active", now: 100 });
    expect(active.effectivePlanId).toBe("better");
    expect(decideEntitlement({ entitlements: active, key: "automation_run", used: 4_999 })).toMatchObject({ allowed: true, remaining: 1 });

    const expired = resolveOrganizationEntitlements({ planId: "better", status: "past_due", graceEndsAt: 99, now: 100 });
    expect(expired.effectivePlanId).toBe("free");
    expect(decideEntitlement({ entitlements: expired, key: "ai" })).toMatchObject({ allowed: false, reason: "AI_UNAVAILABLE" });
  });

  it("applies trial, cancellation, and renewal grace windows at their exact boundaries", () => {
    expect(resolveOrganizationEntitlements({
      planId: "good",
      status: "trialing",
      trialEndsAt: 101,
      now: 100,
    }).effectivePlanId).toBe("good");
    expect(resolveOrganizationEntitlements({
      planId: "good",
      status: "trialing",
      trialEndsAt: 100,
      now: 100,
    }).effectivePlanId).toBe("free");
    expect(resolveOrganizationEntitlements({
      planId: "better",
      status: "canceled",
      currentPeriodEndAt: 101,
      now: 100,
    }).effectivePlanId).toBe("better");
    expect(resolveOrganizationEntitlements({
      planId: "better",
      status: "past_due",
      graceEndsAt: 101,
      now: 100,
    }).effectivePlanId).toBe("better");
  });

  it("keeps over-limit data usable while blocking additional Free resources", () => {
    const free = resolveOrganizationEntitlements({ planId: "better", status: "canceled", now: 100 });
    expect(decideEntitlement({ entitlements: free, key: "project", used: 6 })).toMatchObject({
      allowed: false,
      limit: 5,
      remaining: 0,
      reason: "LIMIT_REACHED",
    });
    expect(decideEntitlement({ entitlements: free, key: "member", used: 3 })).toMatchObject({
      allowed: false,
      limit: 3,
    });
  });
});

describe("AI credit calculator", () => {
  it("charges small models less than standard models", () => {
    const small = calculateAiCredits({ modelId: "gpt-4.1-mini", promptTokens: 1_000, completionTokens: 1_000 });
    const standard = calculateAiCredits({ modelId: "gpt-4.1", promptTokens: 1_000, completionTokens: 1_000 });
    expect(small.credits).toBeLessThan(standard.credits);
  });

  it("charges premium models more than standard models", () => {
    const standard = calculateAiCredits({ modelId: "claude-sonnet", promptTokens: 1_000, completionTokens: 1_000 });
    const premium = calculateAiCredits({ modelId: "claude-opus", promptTokens: 1_000, completionTokens: 1_000 });
    expect(premium.credits).toBeGreaterThan(standard.credits);
  });

  it("uses fallback pricing for unknown models", () => {
    expect(calculateAiCredits({ modelId: "unknown-model", promptTokens: 100 }).modelClass).toBe("fallback");
  });

  it("converts measured provider cost to integer credits", () => {
    expect(creditsForProviderCost(1)).toBe(1_000);
    expect(creditsForProviderCost(0)).toBe(0);
    expect(calculateAiCredits({ modelId: "gpt-4.1", providerCostUsd: 0.0101 }).credits).toBe(11);
  });

  it("spends subscription credits before add-on credits", () => {
    expect(applyUsageToCreditBalance({
      subscriptionCredits: 10,
      addOnCredits: 20,
      requestedCredits: 15,
    })).toMatchObject({
      allowed: true,
      subscriptionCredits: 0,
      addOnCredits: 15,
      subscriptionCreditsUsed: 10,
      addOnCreditsUsed: 5,
    });
  });

  it("blocks usage when subscription and add-on credits are exhausted", () => {
    expect(applyUsageToCreditBalance({
      subscriptionCredits: 2,
      addOnCredits: 3,
      requestedCredits: 6,
    })).toMatchObject({
      allowed: false,
      reason: "AI credit balance is exhausted.",
    });
  });
});
