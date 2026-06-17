import {
  CREDIT_CARD_UNIT_SIZE,
  CREDIT_PACKS,
  FALLBACK_MODEL_CREDIT_MULTIPLIER,
  MODEL_CLASS_CONFIG,
} from "./subscriptionPricingConfig";

export type SubscriptionPlanId = "good" | "better" | "custom";
export type BillingCycle = "monthly" | "yearly";
export type CreditPackId = "starter" | "growth" | "scale";
export type AiModelClass = "small" | "standard" | "premium" | "fallback";
export type UsageMeterKind = "ai_chat" | "agent_link_call" | "api_key_call" | "app_access";
export type BillingProviderId = "dodo" | "manual";

export type SubscriptionEntitlements = {
  aiAccess: boolean;
  includedCredits: number;
  includedCreditCards: number;
  appAccessLevel: "limited" | "standard" | "custom";
  apiKeyQuota: number;
  agentLinkQuota: number;
  supportLevel: "standard" | "priority" | "dedicated";
};

export type GlobalSubscriptionPlan = {
  id: SubscriptionPlanId;
  rank: number;
  pricePerUser: number;
  entitlements: SubscriptionEntitlements;
  supportedCycles: BillingCycle[];
};

export type MarketBillingVariant = {
  planId: SubscriptionPlanId;
  cycle: BillingCycle;
  name: string;
  amount: number | null;
  currency: "USD";
  periodDays: number;
  providerEligibility: BillingProviderId[];
  checkoutMode: "provider" | "contact_sales";
  publicFeatureFlags: {
    highlighted?: boolean;
    contactSales?: boolean;
  };
};

export type CreditPack = {
  id: CreditPackId;
  credits: number;
  amount: number;
  currency: "USD";
  rollover: "billing_window" | "never_expires";
};

export type AiCreditCalculationInput = {
  modelId?: string;
  promptTokens?: number;
  completionTokens?: number;
  toolCallCount?: number;
};

export type AiCreditCalculation = {
  modelClass: AiModelClass;
  credits: number;
  tokenCredits: number;
  toolCredits: number;
  multiplier: number;
};

export type CreditBalance = {
  subscriptionCredits: number;
  addOnCredits: number;
};

export type AppliedCreditUsage = CreditBalance & {
  requestedCredits: number;
  subscriptionCreditsUsed: number;
  addOnCreditsUsed: number;
  allowed: boolean;
  reason?: string;
};

const GLOBAL_PLANS = {
  good: {
    id: "good",
    rank: 10,
    pricePerUser: 7,
    supportedCycles: ["monthly", "yearly"],
    entitlements: {
      aiAccess: false,
      includedCredits: 0,
      includedCreditCards: 0,
      appAccessLevel: "limited",
      apiKeyQuota: 1_000,
      agentLinkQuota: 1,
      supportLevel: "standard",
    },
  },
  better: {
    id: "better",
    rank: 20,
    pricePerUser: 19,
    supportedCycles: ["monthly", "yearly"],
    entitlements: {
      aiAccess: true,
      includedCredits: 12_000,
      includedCreditCards: 3,
      appAccessLevel: "standard",
      apiKeyQuota: 10_000,
      agentLinkQuota: 5,
      supportLevel: "priority",
    },
  },
  custom: {
    id: "custom",
    rank: 30,
    pricePerUser: 0,
    supportedCycles: ["monthly", "yearly"],
    entitlements: {
      aiAccess: true,
      includedCredits: 0,
      includedCreditCards: 0,
      appAccessLevel: "custom",
      apiKeyQuota: 1_000_000_000,
      agentLinkQuota: 1_000_000_000,
      supportLevel: "dedicated",
    },
  },
} satisfies Record<SubscriptionPlanId, GlobalSubscriptionPlan>;

const PLAN_PRICING: MarketBillingVariant[] = [
  {
    planId: "good",
    cycle: "monthly",
    name: "Qentrah Good",
    amount: 7,
    currency: "USD",
    periodDays: 30,
    providerEligibility: ["dodo"],
    checkoutMode: "provider",
    publicFeatureFlags: {},
  },
  {
    planId: "good",
    cycle: "yearly",
    name: "Qentrah Good Annual",
    amount: 70,
    currency: "USD",
    periodDays: 365,
    providerEligibility: ["dodo"],
    checkoutMode: "provider",
    publicFeatureFlags: {},
  },
  {
    planId: "better",
    cycle: "monthly",
    name: "Qentrah Better",
    amount: 19,
    currency: "USD",
    periodDays: 30,
    providerEligibility: ["dodo"],
    checkoutMode: "provider",
    publicFeatureFlags: { highlighted: true },
  },
  {
    planId: "better",
    cycle: "yearly",
    name: "Qentrah Better Annual",
    amount: 190,
    currency: "USD",
    periodDays: 365,
    providerEligibility: ["dodo"],
    checkoutMode: "provider",
    publicFeatureFlags: { highlighted: true },
  },
  {
    planId: "custom",
    cycle: "monthly",
    name: "Qentrah Custom",
    amount: null,
    currency: "USD",
    periodDays: 30,
    providerEligibility: ["manual"],
    checkoutMode: "contact_sales",
    publicFeatureFlags: { contactSales: true },
  },
  {
    planId: "custom",
    cycle: "yearly",
    name: "Qentrah Custom Annual",
    amount: null,
    currency: "USD",
    periodDays: 365,
    providerEligibility: ["manual"],
    checkoutMode: "contact_sales",
    publicFeatureFlags: { contactSales: true },
  },
];

export const DEFAULT_SUBSCRIPTION_PLAN_ID: SubscriptionPlanId = "good";
export const DEFAULT_BILLING_CYCLE: BillingCycle = "monthly";

export function getGlobalPlan(planId: SubscriptionPlanId) {
  return GLOBAL_PLANS[planId];
}

export function listGlobalPlans() {
  return Object.values(GLOBAL_PLANS).sort((left, right) => left.rank - right.rank);
}

export function getMarketPricing(input: {
  planId: SubscriptionPlanId;
  cycle: BillingCycle;
}): MarketBillingVariant {
  return PLAN_PRICING.find((variant) => variant.planId === input.planId && variant.cycle === input.cycle)
    ?? contactSalesPricing(input.planId, input.cycle);
}

export function getCreditPack(input: { packId: CreditPackId }) {
  return CREDIT_PACKS[input.packId];
}

export function listCreditPacks() {
  return Object.values(CREDIT_PACKS);
}

export function includedCreditCardsForPlan(planId: SubscriptionPlanId) {
  const entitlements = resolveSubscriptionEntitlements(planId);
  return {
    cards: entitlements.includedCreditCards,
    credits: entitlements.includedCredits,
    cardSize: CREDIT_CARD_UNIT_SIZE,
  };
}

export function canAddCreditCardsToPlan(planId: SubscriptionPlanId) {
  return getGlobalPlan(planId).id !== "custom";
}

export function listAddOnCreditCards(input: { planId: SubscriptionPlanId }) {
  if (!canAddCreditCardsToPlan(input.planId)) return [];
  return listCreditPacks();
}

export function resolveSubscriptionEntitlements(planId: SubscriptionPlanId) {
  return { ...getGlobalPlan(planId).entitlements };
}

export function normalizeBillingSelection(input?: string | null) {
  const [plan, cycle] = (input ?? "").split("_");
  if (isSubscriptionPlanId(plan) && isBillingCycle(cycle)) {
    return { planId: plan, cycle };
  }
  return { planId: DEFAULT_SUBSCRIPTION_PLAN_ID, cycle: DEFAULT_BILLING_CYCLE };
}

export function billingSelectionKey(input: { planId: SubscriptionPlanId; cycle: BillingCycle }) {
  return `${input.planId}_${input.cycle}`;
}

export function aiModelClass(modelId?: string): AiModelClass {
  const normalized = modelId?.trim() ?? "";
  for (const [modelClass, config] of Object.entries(MODEL_CLASS_CONFIG) as Array<[Exclude<AiModelClass, "fallback">, typeof MODEL_CLASS_CONFIG.small]>) {
    if (config.patterns.some((pattern) => pattern.test(normalized))) return modelClass;
  }
  return "fallback";
}

export function calculateAiCredits(input: AiCreditCalculationInput): AiCreditCalculation {
  const modelClass = aiModelClass(input.modelId);
  const multiplier = modelClass === "fallback" ? FALLBACK_MODEL_CREDIT_MULTIPLIER : MODEL_CLASS_CONFIG[modelClass].multiplier;
  const promptTokens = Math.max(0, Math.ceil(input.promptTokens ?? 0));
  const completionTokens = Math.max(0, Math.ceil(input.completionTokens ?? 0));
  const toolCallCount = Math.max(0, Math.ceil(input.toolCallCount ?? 0));
  const weightedTokens = promptTokens + completionTokens * 3;
  const tokenCredits = Math.ceil((weightedTokens / 1_000) * 10 * multiplier);
  const toolCredits = toolCallCount * 5;
  return {
    modelClass,
    multiplier,
    tokenCredits,
    toolCredits,
    credits: Math.max(1, tokenCredits + toolCredits),
  };
}

export function applyUsageToCreditBalance(input: CreditBalance & { requestedCredits: number }): AppliedCreditUsage {
  const requestedCredits = Math.max(1, Math.ceil(input.requestedCredits));
  const subscriptionCredits = Math.max(0, Math.floor(input.subscriptionCredits));
  const addOnCredits = Math.max(0, Math.floor(input.addOnCredits));
  const availableCredits = subscriptionCredits + addOnCredits;

  if (availableCredits < requestedCredits) {
    return {
      requestedCredits,
      subscriptionCredits,
      addOnCredits,
      subscriptionCreditsUsed: 0,
      addOnCreditsUsed: 0,
      allowed: false,
      reason: "AI credit balance is exhausted.",
    };
  }

  const subscriptionCreditsUsed = Math.min(subscriptionCredits, requestedCredits);
  const addOnCreditsUsed = requestedCredits - subscriptionCreditsUsed;
  return {
    requestedCredits,
    subscriptionCredits: subscriptionCredits - subscriptionCreditsUsed,
    addOnCredits: addOnCredits - addOnCreditsUsed,
    subscriptionCreditsUsed,
    addOnCreditsUsed,
    allowed: true,
  };
}

function contactSalesPricing(planId: SubscriptionPlanId, cycle: BillingCycle): MarketBillingVariant {
  return {
    planId,
    cycle,
    name: `${getGlobalPlan(planId).id} custom pricing`,
    amount: null,
    currency: "USD",
    periodDays: cycle === "yearly" ? 365 : 30,
    providerEligibility: ["manual"],
    checkoutMode: "contact_sales",
    publicFeatureFlags: { contactSales: true },
  };
}

function isSubscriptionPlanId(value?: string): value is SubscriptionPlanId {
  return value === "good" || value === "better" || value === "custom";
}

function isBillingCycle(value?: string): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}
