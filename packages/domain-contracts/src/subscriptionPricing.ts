import {
  CREDIT_CARD_UNIT_SIZE,
  CREDIT_PACKS,
  FALLBACK_MODEL_CREDIT_MULTIPLIER,
  MODEL_CLASS_CONFIG,
} from "./subscriptionPricingConfig";

export type SubscriptionPlanId = "good" | "better" | "custom";
export type MarketId = "sa";
export type BillingCycle = "monthly" | "yearly";
export type CreditPackId = "starter" | "growth" | "scale";
export type AiModelClass = "small" | "standard" | "premium" | "fallback";
export type UsageMeterKind = "ai_chat" | "agent_link_call" | "api_key_call" | "app_access";
export type BillingProviderId = "tamara" | "manual";
export type LegacyBillingPlanId = "saudi_monthly" | "saudi_yearly";

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
  entitlements: SubscriptionEntitlements;
  supportedCycles: BillingCycle[];
};

export type MarketBillingVariant = {
  marketId: MarketId;
  planId: SubscriptionPlanId;
  cycle: BillingCycle;
  legacyPlanId?: LegacyBillingPlanId;
  name: string;
  amount: number | null;
  currency: "SAR";
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
  currency: "SAR";
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

const SAUDI_MARKET_PRICING = [
  {
    marketId: "sa",
    planId: "good",
    cycle: "monthly",
    legacyPlanId: "saudi_monthly",
    name: "Qentrah Good",
    amount: 499,
    currency: "SAR",
    periodDays: 30,
    providerEligibility: ["manual"],
    checkoutMode: "provider",
    publicFeatureFlags: {},
  },
  {
    marketId: "sa",
    planId: "good",
    cycle: "yearly",
    legacyPlanId: "saudi_yearly",
    name: "Qentrah Good Annual",
    amount: 5_988,
    currency: "SAR",
    periodDays: 365,
    providerEligibility: ["tamara"],
    checkoutMode: "provider",
    publicFeatureFlags: {},
  },
  {
    marketId: "sa",
    planId: "better",
    cycle: "monthly",
    name: "Qentrah Better",
    amount: 899,
    currency: "SAR",
    periodDays: 30,
    providerEligibility: ["manual"],
    checkoutMode: "provider",
    publicFeatureFlags: { highlighted: true },
  },
  {
    marketId: "sa",
    planId: "better",
    cycle: "yearly",
    name: "Qentrah Better Annual",
    amount: 9_588,
    currency: "SAR",
    periodDays: 365,
    providerEligibility: ["tamara"],
    checkoutMode: "provider",
    publicFeatureFlags: { highlighted: true },
  },
  {
    marketId: "sa",
    planId: "custom",
    cycle: "monthly",
    name: "Qentrah Custom",
    amount: null,
    currency: "SAR",
    periodDays: 30,
    providerEligibility: ["manual"],
    checkoutMode: "contact_sales",
    publicFeatureFlags: { contactSales: true },
  },
  {
    marketId: "sa",
    planId: "custom",
    cycle: "yearly",
    name: "Qentrah Custom Annual",
    amount: null,
    currency: "SAR",
    periodDays: 365,
    providerEligibility: ["manual"],
    checkoutMode: "contact_sales",
    publicFeatureFlags: { contactSales: true },
  },
] satisfies MarketBillingVariant[];

export const DEFAULT_MARKET_ID: MarketId = "sa";
export const DEFAULT_SUBSCRIPTION_PLAN_ID: SubscriptionPlanId = "good";
export const DEFAULT_BILLING_CYCLE: BillingCycle = "monthly";

export function getGlobalPlan(planId: SubscriptionPlanId) {
  return GLOBAL_PLANS[planId];
}

export function listGlobalPlans() {
  return Object.values(GLOBAL_PLANS).sort((left, right) => left.rank - right.rank);
}

export function getMarketPricing(input: {
  marketId?: MarketId | string;
  planId: SubscriptionPlanId;
  cycle: BillingCycle;
}): MarketBillingVariant {
  if (input.marketId !== DEFAULT_MARKET_ID && input.marketId !== undefined) {
    return contactSalesPricing(input.planId, input.cycle);
  }

  return SAUDI_MARKET_PRICING.find((variant) => variant.planId === input.planId && variant.cycle === input.cycle)
    ?? contactSalesPricing(input.planId, input.cycle);
}

export function getCreditPack(input: { marketId?: MarketId | string; packId: CreditPackId }) {
  if (input.marketId !== DEFAULT_MARKET_ID && input.marketId !== undefined) return null;
  return CREDIT_PACKS[input.packId];
}

export function listCreditPacks(marketId: MarketId | string = DEFAULT_MARKET_ID) {
  if (marketId !== DEFAULT_MARKET_ID) return [];
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

export function listAddOnCreditCards(input: { marketId?: MarketId | string; planId: SubscriptionPlanId }) {
  if (!canAddCreditCardsToPlan(input.planId)) return [];
  return listCreditPacks(input.marketId);
}

export function resolveSubscriptionEntitlements(planId: SubscriptionPlanId) {
  return { ...getGlobalPlan(planId).entitlements };
}

export function mapLegacyBillingPlanId(planId: LegacyBillingPlanId) {
  if (planId === "saudi_yearly") return { planId: "good" as const, cycle: "yearly" as const, marketId: DEFAULT_MARKET_ID };
  return { planId: "good" as const, cycle: "monthly" as const, marketId: DEFAULT_MARKET_ID };
}

export function isLegacyBillingPlanId(value: string): value is LegacyBillingPlanId {
  return value === "saudi_monthly" || value === "saudi_yearly";
}

export function normalizeBillingSelection(input?: string | null) {
  if (input && isLegacyBillingPlanId(input)) return mapLegacyBillingPlanId(input);
  const [plan, cycle] = (input ?? "").split("_");
  if (isSubscriptionPlanId(plan) && isBillingCycle(cycle)) {
    return { planId: plan, cycle, marketId: DEFAULT_MARKET_ID };
  }
  return { planId: DEFAULT_SUBSCRIPTION_PLAN_ID, cycle: DEFAULT_BILLING_CYCLE, marketId: DEFAULT_MARKET_ID };
}

export function billingSelectionKey(input: { planId: SubscriptionPlanId; cycle: BillingCycle }) {
  return `${input.planId}_${input.cycle}`;
}

export function isTamaraEligible(variant: Pick<MarketBillingVariant, "providerEligibility">) {
  return variant.providerEligibility.includes("tamara");
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
    marketId: DEFAULT_MARKET_ID,
    planId,
    cycle,
    name: `${getGlobalPlan(planId).id} custom pricing`,
    amount: null,
    currency: "SAR",
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
