import { action } from "../_generated/server";
import { v } from "convex/values";
import { checkout, customerPortal, PRICING_PLANS } from "./dodo";

// Map internal plan IDs to DodoPayments product IDs
// Set these in your Convex environment variables
const DODO_PRODUCT_ID_MAP: Record<string, string> = {
  good_monthly: process.env.DODO_PRODUCT_GOOD_MONTHLY || "good_monthly",
  good_yearly: process.env.DODO_PRODUCT_GOOD_YEARLY || "good_yearly",
  better_monthly: process.env.DODO_PRODUCT_BETTER_MONTHLY || "better_monthly",
  better_yearly: process.env.DODO_PRODUCT_BETTER_YEARLY || "better_yearly",
};

export const createCheckout = action({
  args: {
    planId: v.string(),
    quantity: v.number(),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const plan =
      PRICING_PLANS[args.planId as keyof typeof PRICING_PLANS];

    if (!plan) {
      throw new Error(`Plan not found: ${args.planId}`);
    }

    if (plan.pricePerUser === null) {
      throw new Error(`Plan ${args.planId} requires contact sales`);
    }

    // Map internal plan ID to DodoPayments product ID
    const dodoProductId = DODO_PRODUCT_ID_MAP[args.planId] || args.planId;

    const checkoutPayload: {
      product_cart: { product_id: string; quantity: number }[];
      billing_currency?: string;
      return_url?: string;
      feature_flags?: { allow_discount_code?: boolean };
    } = {
      product_cart: [
        {
          product_id: dodoProductId,
          quantity: args.quantity,
        },
      ],
      billing_currency: plan.currency,
      feature_flags: {
        allow_discount_code: true,
      },
    };

    if (args.returnUrl) {
      checkoutPayload.return_url = args.returnUrl;
    }

    const result = await checkout(ctx, {
      payload: checkoutPayload,
    });

    return result;
  },
});

export const getCustomerPortal = action({
  args: {},
  handler: async (ctx, args) => {
    const result = await customerPortal(ctx, {});

    return result;
  },
});

export const listPlans = action({
  args: {},
  handler: async (ctx) => {
    return PRICING_PLANS;
  },
});
