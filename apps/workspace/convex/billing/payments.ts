import { action } from "../_generated/server";
import { v } from "convex/values";
import { checkout, customerPortal, PRICING_PLANS } from "./dodo";

/**
 * Create a checkout session for a subscription plan
 * Example: createCheckout { planId: "pro_monthly", quantity: 2, returnUrl: "https://qentrah.com/dashboard" }
 */
export const createCheckout = action({
  args: {
    planId: v.string(),
    quantity: v.number(), // number of users/seats
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const plan =
      PRICING_PLANS[args.planId as keyof typeof PRICING_PLANS];

    if (!plan) {
      throw new Error(`Plan not found: ${args.planId}`);
    }

    const totalPrice = Math.round(plan.pricePerUser * args.quantity * 100); // Convert to cents

    const result = await checkout(ctx, {
      payload: {
        product_cart: [
          {
            product_id: args.planId,
            quantity: args.quantity,
          },
        ],
        return_url: args.returnUrl || "https://qentrah.com/dashboard",
        billing_currency: plan.currency,
        feature_flags: {
          allow_discount_code: true,
        },
      },
    });

    return result;
  },
});

/**
 * Get customer portal URL for subscription management
 */
export const getCustomerPortal = action({
  args: {
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await customerPortal(ctx, {
      return_url: args.returnUrl || "https://qentrah.com/dashboard",
    });

    return result;
  },
});

/**
 * List available plans
 */
export const listPlans = action({
  args: {},
  handler: async (ctx) => {
    return PRICING_PLANS;
  },
});
