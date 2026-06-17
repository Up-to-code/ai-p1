import {
  applyUsageToCreditBalance,
  calculateAiCredits,
  resolveSubscriptionEntitlements,
  type SubscriptionPlanId,
} from "@qentrah/domain-contracts/subscription-pricing";

export type StoredCreditBalance = {
  _id: string;
  organizationId: string;
  planId: string;
  subscriptionCreditsGranted: number;
  subscriptionCreditsUsed: number;
  addOnCreditsGranted: number;
  addOnCreditsUsed: number;
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
  updatedAt: number;
};

export type StoredCreditLedger = {
  _id: string;
  organizationId: string;
  kind: "grant" | "top_up" | "usage" | "adjustment";
  agentRunId?: string;
  calculatedCredits: number;
  requestedCredits: number;
  subscriptionCreditsDelta: number;
  addOnCreditsDelta: number;
  subscriptionCreditsUsed: number;
  addOnCreditsUsed: number;
  createdAt: number;
};

export type CreditUsageSummary = {
  subscriptionCreditsGranted: number;
  subscriptionCreditsUsed: number;
  subscriptionCreditsRemaining: number;
  addOnCreditsGranted: number;
  addOnCreditsUsed: number;
  addOnCreditsRemaining: number;
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
};

export function includedCreditsForBillingPlan(planId?: string | null) {
  if (!planId) return 0;
  const base = planId.replace(/_monthly|_yearly$/, "") as SubscriptionPlanId;
  if (base !== "good" && base !== "better" && base !== "custom") return 0;
  return resolveSubscriptionEntitlements(base).includedCredits;
}

function nonNegativeInteger(value: number | undefined) {
  return Math.max(0, Math.floor(value ?? 0));
}

export function creditUsageSummary(input: {
  balance?: StoredCreditBalance | null;
  fallbackSubscriptionCreditsGranted?: number;
  currentPeriodStartAt?: number;
  currentPeriodEndAt?: number;
}): CreditUsageSummary {
  const subscriptionCreditsGranted = nonNegativeInteger(
    input.balance?.subscriptionCreditsGranted ?? input.fallbackSubscriptionCreditsGranted,
  );
  const subscriptionCreditsUsed = Math.min(
    subscriptionCreditsGranted,
    nonNegativeInteger(input.balance?.subscriptionCreditsUsed),
  );
  const addOnCreditsGranted = nonNegativeInteger(input.balance?.addOnCreditsGranted);
  const addOnCreditsUsed = Math.min(addOnCreditsGranted, nonNegativeInteger(input.balance?.addOnCreditsUsed));

  return {
    subscriptionCreditsGranted,
    subscriptionCreditsUsed,
    subscriptionCreditsRemaining: subscriptionCreditsGranted - subscriptionCreditsUsed,
    addOnCreditsGranted,
    addOnCreditsUsed,
    addOnCreditsRemaining: addOnCreditsGranted - addOnCreditsUsed,
    currentPeriodStartAt: input.balance?.currentPeriodStartAt ?? input.currentPeriodStartAt,
    currentPeriodEndAt: input.balance?.currentPeriodEndAt ?? input.currentPeriodEndAt,
  };
}

export function applyCreditUsageToBalance(input: {
  balance: Pick<StoredCreditBalance, "subscriptionCreditsGranted" | "subscriptionCreditsUsed" | "addOnCreditsGranted" | "addOnCreditsUsed">;
  requestedCredits: number;
}) {
  return applyUsageToCreditBalance({
    requestedCredits: input.requestedCredits,
    subscriptionCredits: Math.max(0, input.balance.subscriptionCreditsGranted - input.balance.subscriptionCreditsUsed),
    addOnCredits: Math.max(0, input.balance.addOnCreditsGranted - input.balance.addOnCreditsUsed),
  });
}

export function calculateAgentRunCredits(input: {
  modelId?: string;
  promptTokens?: number;
  completionTokens?: number;
  toolCallCount?: number;
}) {
  if (input.promptTokens === undefined && input.completionTokens === undefined) return 1;
  return calculateAiCredits(input).credits;
}
