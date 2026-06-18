import { z } from "zod";

export const billingCheckoutSchema = z.object({
  // Single plan — always "qentrah_workspace"
  planId: z.literal("qentrah_workspace").default("qentrah_workspace"),
  // Number of seats (users) to bill for; defaults to 1, minimum 1
  seats: z.number().int().min(1).default(1),
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
    product_id: z.string().optional(),
    quantity: z.number().optional(),
    current_period_start: z.number().optional(),
    current_period_end: z.number().optional(),
  }).passthrough(),
});

export type BillingCheckoutPayload = z.infer<typeof billingCheckoutSchema>;
export type DodoWebhookPayload = z.infer<typeof dodoWebhookSchema>;
