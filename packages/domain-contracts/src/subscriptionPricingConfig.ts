import type { AiModelClass, CreditPack, CreditPackId } from "./subscriptionPricing";

export const CREDIT_PACKS = {
  starter: { id: "starter", credits: 5_000, amount: 5, currency: "USD", rollover: "never_expires" },
  growth: { id: "growth", credits: 15_000, amount: 15, currency: "USD", rollover: "never_expires" },
  scale: { id: "scale", credits: 50_000, amount: 50, currency: "USD", rollover: "never_expires" },
} satisfies Record<CreditPackId, CreditPack>;

export const MODEL_CLASS_CONFIG = {
  small: {
    multiplier: 0.45,
    patterns: [/mini/iu, /small/iu, /haiku/iu, /flash/iu, /lite/iu],
  },
  standard: {
    multiplier: 1,
    patterns: [/gpt-4\.1(?!.*mini)/iu, /sonnet/iu, /gemini-1\.5-pro/iu],
  },
  premium: {
    multiplier: 2.5,
    patterns: [/opus/iu, /o1/iu, /o3/iu, /premium/iu],
  },
} satisfies Record<Exclude<AiModelClass, "fallback">, { multiplier: number; patterns: RegExp[] }>;

export const FALLBACK_MODEL_CREDIT_MULTIPLIER = 1.25;
export const CREDIT_CARD_UNIT_SIZE = 1_000;
export const CREDITS_PER_USD = 1_000;
export const MIN_CUSTOM_CREDIT_PURCHASE_USD = 1;
export const MAX_CUSTOM_CREDIT_PURCHASE_USD = 1_000;
