import {
  applyUsageToCreditBalance,
  type SubscriptionEntitlements,
  type UsageMeterKind,
} from "@qentrah/domain-contracts/subscription-pricing";

export type UsageMeterRecord = {
  _id?: string;
  organizationId: string;
  meter: UsageMeterKind;
  windowStartedAt: number;
  windowEndsAt: number;
  used: number;
  limit: number;
  addOnUsed?: number;
  addOnLimit?: number;
  updatedAt: number;
};

export type UsageProjection = {
  meter: UsageMeterKind;
  used: number;
  limit: number;
  remaining: number;
  requested: number;
  allowed: boolean;
  reason?: string;
  subscriptionUsed?: number;
  subscriptionLimit?: number;
  subscriptionRemaining?: number;
  addOnUsed?: number;
  addOnLimit?: number;
  addOnRemaining?: number;
  subscriptionCreditsUsed?: number;
  addOnCreditsUsed?: number;
};

export function billingWindow(input: {
  now: number;
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
}) {
  if (input.currentPeriodStartAt && input.currentPeriodEndAt && input.currentPeriodEndAt > input.now) {
    return {
      windowStartedAt: input.currentPeriodStartAt,
      windowEndsAt: input.currentPeriodEndAt,
    };
  }

  const windowStartedAt = input.now;
  return {
    windowStartedAt,
    windowEndsAt: windowStartedAt + 30 * 24 * 60 * 60 * 1000,
  };
}

export function meterLimit(entitlements: SubscriptionEntitlements, meter: UsageMeterKind) {
  if (meter === "ai_chat") return entitlements.aiAccess ? entitlements.includedCredits : 0;
  if (meter === "agent_link_call") return entitlements.agentLinkQuota;
  if (meter === "api_key_call") return entitlements.apiKeyQuota;
  return entitlements.appAccessLevel === "limited" ? 1 : entitlements.appAccessLevel === "standard" ? 25 : 1_000_000_000;
}

export function creditLedgerProjection(input: {
  meter: UsageMeterKind;
  entitlements: SubscriptionEntitlements;
  existing: UsageMeterRecord | null;
  requested?: number;
}): UsageProjection {
  const subscriptionLimit = meterLimit(input.entitlements, input.meter);
  const subscriptionUsed = input.existing?.used ?? 0;
  const addOnLimit = input.meter === "ai_chat" ? input.existing?.addOnLimit ?? 0 : 0;
  const addOnUsed = input.meter === "ai_chat" ? input.existing?.addOnUsed ?? 0 : 0;
  const requested = Math.max(1, Math.ceil(input.requested ?? 1));
  const subscriptionRemaining = Math.max(0, subscriptionLimit - subscriptionUsed);
  const addOnRemaining = Math.max(0, addOnLimit - addOnUsed);
  const limit = subscriptionLimit + addOnLimit;
  const used = subscriptionUsed + addOnUsed;
  const remaining = subscriptionRemaining + addOnRemaining;

  if (subscriptionLimit <= 0 && addOnLimit <= 0) {
    return {
      meter: input.meter,
      used,
      limit,
      remaining,
      requested,
      allowed: false,
      reason: "Plan does not include this entitlement.",
      subscriptionUsed,
      subscriptionLimit,
      subscriptionRemaining,
      addOnUsed,
      addOnLimit,
      addOnRemaining,
    };
  }

  const applied = applyUsageToCreditBalance({
    subscriptionCredits: subscriptionRemaining,
    addOnCredits: addOnRemaining,
    requestedCredits: requested,
  });

  return {
    meter: input.meter,
    used,
    limit,
    remaining,
    requested,
    allowed: applied.allowed,
    reason: applied.allowed ? undefined : "Usage limit exhausted for this billing window.",
    subscriptionUsed,
    subscriptionLimit,
    subscriptionRemaining,
    addOnUsed,
    addOnLimit,
    addOnRemaining,
    subscriptionCreditsUsed: applied.subscriptionCreditsUsed,
    addOnCreditsUsed: applied.addOnCreditsUsed,
  };
}

export function nextUsageMeterState(input: {
  projection: UsageProjection;
  existing: UsageMeterRecord | null;
  requested: number;
}) {
  const subscriptionCreditsUsed = input.projection.subscriptionCreditsUsed ?? Math.max(1, Math.ceil(input.requested));
  const addOnCreditsUsed = input.projection.addOnCreditsUsed ?? 0;
  return {
    used: (input.existing?.used ?? 0) + subscriptionCreditsUsed,
    limit: input.projection.subscriptionLimit ?? input.projection.limit,
    addOnUsed: (input.existing?.addOnUsed ?? 0) + addOnCreditsUsed,
    addOnLimit: input.projection.addOnLimit ?? input.existing?.addOnLimit ?? 0,
  };
}

export function usageProjection(input: {
  meter: UsageMeterKind;
  entitlements: SubscriptionEntitlements;
  existing: UsageMeterRecord | null;
  requested?: number;
}) {
  return creditLedgerProjection(input);
}
