import { z } from "zod";

export const billingCheckoutSchema = z.object({
  planId: z.enum([
    "good_monthly",
    "good_yearly",
    "better_monthly",
    "better_yearly",
    "custom_monthly",
    "custom_yearly",
  ]).default("good_monthly"),
  locale: z.enum(["en", "ar"]).default("en"),
  returnUrl: z.string().optional(),
});

export const dodoWebhookSchema = z.object({
  event_type: z.string().trim().min(1),
  data: z.object({
    payment_id: z.string().optional(),
    subscription_id: z.string().optional(),
    customer_id: z.string().optional(),
    status: z.string().optional(),
    total_amount: z.number().optional(),
    currency: z.string().optional(),
    failure_reason: z.string().optional(),
    plan_id: z.string().optional(),
    current_period_start: z.number().optional(),
    current_period_end: z.number().optional(),
  }).passthrough(),
});

export type BillingCheckoutPayload = z.infer<typeof billingCheckoutSchema>;
export type DodoWebhookPayload = z.infer<typeof dodoWebhookSchema>;
