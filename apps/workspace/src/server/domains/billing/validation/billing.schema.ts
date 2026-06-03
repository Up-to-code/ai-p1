import { z } from "zod";

export const billingCheckoutSchema = z.object({
  planId: z.string().trim().min(1).default("good_monthly"),
  marketId: z.string().trim().min(1).default("sa"),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  locale: z.enum(["en", "ar"]).default("en"),
  discount: z.object({
    name: z.string().trim().min(1),
    amount: z.number().positive(),
    currency: z.literal("SAR").default("SAR"),
  }).optional(),
});

export const tamaraWebhookSchema = z.object({
  order_id: z.string().trim().min(1).optional(),
  order_reference_id: z.string().trim().min(1).optional(),
  order_number: z.string().trim().optional(),
  event_type: z.string().trim().min(1),
  data: z.array(z.unknown()).optional().default([]),
});

export type BillingCheckoutPayload = z.infer<typeof billingCheckoutSchema>;
export type TamaraWebhookPayload = z.infer<typeof tamaraWebhookSchema>;
