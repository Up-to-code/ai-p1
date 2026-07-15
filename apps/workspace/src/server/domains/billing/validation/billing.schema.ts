import { z } from "zod";

export const billingCheckoutSchema = z.object({
  planId: z.enum([
    "good_monthly",
    "good_yearly",
    "better_monthly",
    "better_yearly",
  ]).default("good_monthly"),
  // Number of seats (users) to bill for; defaults to 1, minimum 1
  seats: z.number().int().min(1).default(1),
  locale: z.enum(["en", "ar"]).default("en"),
  returnUrl: z.string().optional(),
});

export const billingCreditCheckoutSchema = z.object({
  dollars: z.number().int().min(1).max(1_000),
  locale: z.enum(["en", "ar"]).default("en"),
  returnUrl: z.string().optional(),
});

export const billingCancellationSchema = z.object({
  cancelAtPeriodEnd: z.boolean(),
});

export const billingPlanChangeSchema = z.object({
  planId: z.enum(["good_monthly", "good_yearly", "better_monthly", "better_yearly"]).nullable(),
});

export type BillingCheckoutPayload = z.infer<typeof billingCheckoutSchema>;
export type BillingCreditCheckoutPayload = z.infer<typeof billingCreditCheckoutSchema>;
