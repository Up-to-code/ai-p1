import type { AiModelClass, CreditPack, CreditPackId } from "./subscriptionPricing";

export const CREDIT_PACKS = {
  starter: { id: "starter", credits: 4_000, amount: 99, currency: "SAR", rollover: "billing_window" },
  growth: { id: "growth", credits: 12_000, amount: 249, currency: "SAR", rollover: "billing_window" },
  scale: { id: "scale", credits: 40_000, amount: 699, currency: "SAR", rollover: "billing_window" },
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
export const CREDIT_CARD_UNIT_SIZE = 4_000;
