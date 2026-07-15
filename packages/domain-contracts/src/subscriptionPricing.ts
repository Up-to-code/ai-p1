import {
  CREDIT_CARD_UNIT_SIZE,
  CREDIT_PACKS,
  CREDITS_PER_USD,
  FALLBACK_MODEL_CREDIT_MULTIPLIER,
  MAX_CUSTOM_CREDIT_PURCHASE_USD,
  MIN_CUSTOM_CREDIT_PURCHASE_USD,
  MODEL_CLASS_CONFIG,
} from "./subscriptionPricingConfig";

export type SubscriptionPlanId = "free" | "good" | "better" | "custom";
export type BillingCycle = "monthly" | "yearly";
export type BillingPlanKey =
  | "free"
  | "good_monthly"
  | "good_yearly"
  | "better_monthly"
  | "better_yearly"
  | "custom_monthly"
  | "custom_yearly"
  | "qentrah_workspace";
export type CreditPackId = "starter" | "growth" | "scale";
export type AiModelClass = "small" | "standard" | "premium" | "fallback";
export type UsageMeterKind = "ai_chat" | "agent_link_call" | "api_key_call" | "app_access";
export type BillingProviderId = "dodo" | "manual";
export type SubscriptionStatus = "free" | "inactive" | "pending" | "trialing" | "active" | "past_due" | "canceled";
export type EntitlementKey =
  | "member"
  | "project"
  | "storage_bytes"
  | "guest"
  | "webhook"
  | "automation_run"
  | "api_call"
  | "agent_link"
  | "ai"
  | "custom_role"
  | "sso";

export type SubscriptionEntitlements = {
  aiAccess: boolean;
  includedCredits: number;
  includedCreditCards: number;
  appAccessLevel: "free" | "limited" | "standard" | "custom";
  memberLimit: number | null;
  projectLimit: number | null;
  storageBytesLimit: number | null;
  guestLimit: number | null;
  webhookLimit: number | null;
  automationRunLimit: number;
  auditLogDays: number | null;
  customRoles: boolean;
  sso: "none" | "google" | "saml_scim";
  canPurchaseCredits: boolean;
  apiKeyQuota: number;
  agentLinkQuota: number;
  supportLevel: "community" | "standard" | "priority" | "dedicated";
};

export type EnterpriseEntitlementOverrides = Partial<SubscriptionEntitlements>;

export type OrganizationEntitlements = SubscriptionEntitlements & {
  configuredPlanId: SubscriptionPlanId;
  effectivePlanId: SubscriptionPlanId;
  status: SubscriptionStatus;
  accessActive: boolean;
  currentPeriodEndAt?: number;
  graceEndsAt?: number;
  trialEndsAt?: number;
};

export type EntitlementDecision = {
  allowed: boolean;
  key: EntitlementKey;
  limit: number | null;
  used: number;
  remaining: number | null;
  reason?: "PLAN_REQUIRED" | "LIMIT_REACHED" | "AI_UNAVAILABLE";
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

export type CreditPurchase = {
  orderId: string;
  organizationId: string;
  amountUsd: number;
  credits: number;
  status: "pending" | "succeeded" | "failed" | "refunded" | "chargeback";
  purchasedAt?: number;
  refundedAt?: number;
  manualReviewRequired?: boolean;
};

export type CreditReservation = {
  reservationId: string;
  organizationId: string;
  runId: string;
  actorUserId: string;
  model: string;
  reservedCredits: number;
  status: "reserved" | "settled" | "released" | "reversed";
  providerCostUsd?: number;
  settledCredits?: number;
};

export type AiCreditCalculationInput = {
  modelId?: string;
  providerCostUsd?: number;
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
  free: {
    id: "free",
    rank: 0,
    pricePerUser: 0,
    supportedCycles: ["monthly", "yearly"],
    entitlements: {
      aiAccess: false,
      includedCredits: 0,
      includedCreditCards: 0,
      appAccessLevel: "free",
      memberLimit: 3,
      projectLimit: 5,
      storageBytesLimit: 60 * 1024 * 1024,
      guestLimit: 0,
      webhookLimit: 0,
      automationRunLimit: 0,
      auditLogDays: 0,
      customRoles: false,
      sso: "none",
      canPurchaseCredits: false,
      apiKeyQuota: 0,
      agentLinkQuota: 0,
      supportLevel: "community",
    },
  },
  good: {
    id: "good",
    rank: 10,
    pricePerUser: 7,
    supportedCycles: ["monthly", "yearly"],
    entitlements: {
      aiAccess: true,
      includedCredits: 3_000,
      includedCreditCards: 3,
      appAccessLevel: "limited",
      memberLimit: null,
      projectLimit: null,
      storageBytesLimit: null,
      guestLimit: 5,
      webhookLimit: 10,
      automationRunLimit: 1_000,
      auditLogDays: 7,
      customRoles: false,
      sso: "none",
      canPurchaseCredits: true,
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
      includedCredits: 10_000,
      includedCreditCards: 10,
      appAccessLevel: "standard",
      memberLimit: null,
      projectLimit: null,
      storageBytesLimit: null,
      guestLimit: null,
      webhookLimit: null,
      automationRunLimit: 5_000,
      auditLogDays: 7,
      customRoles: false,
      sso: "google",
      canPurchaseCredits: true,
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
      memberLimit: null,
      projectLimit: null,
      storageBytesLimit: null,
      guestLimit: null,
      webhookLimit: null,
      automationRunLimit: 250_000,
      auditLogDays: 365,
      customRoles: true,
      sso: "saml_scim",
      canPurchaseCredits: false,
      apiKeyQuota: 1_000_000_000,
      agentLinkQuota: 1_000_000_000,
      supportLevel: "dedicated",
    },
  },
} satisfies Record<SubscriptionPlanId, GlobalSubscriptionPlan>;

const PLAN_PRICING: MarketBillingVariant[] = [
  {
    planId: "free",
    cycle: "monthly",
    name: "Free Forever",
    amount: 0,
    currency: "USD",
    periodDays: 30,
    providerEligibility: ["manual"],
    checkoutMode: "contact_sales",
    publicFeatureFlags: {},
  },
  {
    planId: "free",
    cycle: "yearly",
    name: "Free Forever",
    amount: 0,
    currency: "USD",
    periodDays: 365,
    providerEligibility: ["manual"],
    checkoutMode: "contact_sales",
    publicFeatureFlags: {},
  },
  {
    planId: "good",
    cycle: "monthly",
    name: "Unlimited",
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
    name: "Unlimited Annual",
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
    name: "Business",
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
    name: "Business Annual",
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
    name: "Enterprise",
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
    name: "Enterprise Annual",
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
  return getGlobalPlan(planId).entitlements.canPurchaseCredits;
}

export function listAddOnCreditCards(input: { planId: SubscriptionPlanId }) {
  if (!canAddCreditCardsToPlan(input.planId)) return [];
  return listCreditPacks();
}

export function resolveSubscriptionEntitlements(
  planId: SubscriptionPlanId,
  overrides?: EnterpriseEntitlementOverrides,
) {
  const entitlements = { ...getGlobalPlan(planId).entitlements };
  return planId === "custom" && overrides ? { ...entitlements, ...overrides } : entitlements;
}

export function resolveOrganizationEntitlements(input: {
  planId?: SubscriptionPlanId | null;
  status?: SubscriptionStatus | null;
  currentPeriodEndAt?: number;
  graceEndsAt?: number;
  trialEndsAt?: number;
  now?: number;
  enterpriseOverrides?: EnterpriseEntitlementOverrides;
}): OrganizationEntitlements {
  const now = input.now ?? Date.now();
  const configuredPlanId = input.planId ?? "free";
  const status = input.status ?? "free";
  const paidPeriodActive = status === "canceled" && (input.currentPeriodEndAt ?? 0) > now;
  const graceActive = status === "past_due" && (input.graceEndsAt ?? 0) > now;
  const trialActive = status === "trialing" && (input.trialEndsAt === undefined || input.trialEndsAt > now);
  const accessActive = trialActive || status === "active" || paidPeriodActive || graceActive;
  const effectivePlanId = accessActive ? configuredPlanId : "free";
  return {
    ...resolveSubscriptionEntitlements(effectivePlanId, input.enterpriseOverrides),
    configuredPlanId,
    effectivePlanId,
    status,
    accessActive,
    currentPeriodEndAt: input.currentPeriodEndAt,
    graceEndsAt: input.graceEndsAt,
    trialEndsAt: input.trialEndsAt,
  };
}

export function decideEntitlement(input: {
  entitlements: OrganizationEntitlements;
  key: EntitlementKey;
  used?: number;
  requestedUnits?: number;
}): EntitlementDecision {
  const used = Math.max(0, Math.floor(input.used ?? 0));
  const requestedUnits = Math.max(1, Math.floor(input.requestedUnits ?? 1));
  const limit = entitlementLimit(input.entitlements, input.key);
  if (input.key === "ai" && !input.entitlements.aiAccess) {
    return { allowed: false, key: input.key, limit: 0, used, remaining: 0, reason: "AI_UNAVAILABLE" };
  }
  if (typeof limit === "boolean") {
    return {
      allowed: limit,
      key: input.key,
      limit: limit ? null : 0,
      used,
      remaining: limit ? null : 0,
      reason: limit ? undefined : "PLAN_REQUIRED",
    };
  }
  const remaining = limit === null ? null : Math.max(0, limit - used);
  const allowed = remaining === null || remaining >= requestedUnits;
  return {
    allowed,
    key: input.key,
    limit,
    used,
    remaining,
    reason: allowed ? undefined : "LIMIT_REACHED",
  };
}

export function normalizeBillingSelection(input?: string | null) {
  if (input === "qentrah_workspace") return { planId: "good" as const, cycle: "monthly" as const };
  const [plan, cycle] = (input ?? "").split("_");
  if (isSubscriptionPlanId(plan) && isBillingCycle(cycle)) {
    return { planId: plan, cycle };
  }
  return { planId: DEFAULT_SUBSCRIPTION_PLAN_ID, cycle: DEFAULT_BILLING_CYCLE };
}

export function normalizeBillingPlanKey(input?: string | null): BillingPlanKey {
  if (input === "qentrah_workspace") return input;
  if (input === "free") return input;
  const selection = normalizeBillingSelection(input);
  return billingSelectionKey(selection);
}

export function subscriptionPlanIdForBillingKey(input?: string | null): SubscriptionPlanId {
  if (input === "qentrah_workspace") return "good";
  if (input === "free") return "free";
  return normalizeBillingSelection(input).planId;
}

export function billingCycleForKey(input?: string | null): BillingCycle {
  if (input === "free" || input === "qentrah_workspace") return "monthly";
  return normalizeBillingSelection(input).cycle;
}

export function billingSelectionKey(input: { planId: SubscriptionPlanId; cycle: BillingCycle }): Exclude<BillingPlanKey, "free" | "qentrah_workspace"> | "free" {
  if (input.planId === "free") return "free";
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
  if (input.providerCostUsd !== undefined) {
    const credits = creditsForProviderCost(input.providerCostUsd);
    return { modelClass, multiplier, tokenCredits: credits, toolCredits: 0, credits };
  }
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

export function creditsForProviderCost(providerCostUsd: number) {
  return Math.max(0, Math.ceil(Math.max(0, providerCostUsd) * CREDITS_PER_USD));
}

export function customCreditPurchase(amountUsd: number): CreditPack {
  const amount = Math.floor(amountUsd);
  if (amount < MIN_CUSTOM_CREDIT_PURCHASE_USD || amount > MAX_CUSTOM_CREDIT_PURCHASE_USD) {
    throw new RangeError(`Custom AI credit purchase must be between $${MIN_CUSTOM_CREDIT_PURCHASE_USD} and $${MAX_CUSTOM_CREDIT_PURCHASE_USD}.`);
  }
  return {
    id: "starter",
    amount,
    credits: amount * CREDITS_PER_USD,
    currency: "USD",
    rollover: "never_expires",
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
  return value === "free" || value === "good" || value === "better" || value === "custom";
}

function isBillingCycle(value?: string): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}

function entitlementLimit(entitlements: OrganizationEntitlements, key: EntitlementKey): number | null | boolean {
  switch (key) {
    case "member": return entitlements.memberLimit;
    case "project": return entitlements.projectLimit;
    case "storage_bytes": return entitlements.storageBytesLimit;
    case "guest": return entitlements.guestLimit;
    case "webhook": return entitlements.webhookLimit;
    case "automation_run": return entitlements.automationRunLimit;
    case "api_call": return entitlements.apiKeyQuota;
    case "agent_link": return entitlements.agentLinkQuota;
    case "ai": return entitlements.aiAccess;
    case "custom_role": return entitlements.customRoles;
    case "sso": return entitlements.sso !== "none";
  }
}
