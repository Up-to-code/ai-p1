import { action } from "../_generated/server";
import { v } from "convex/values";
import { checkout, customerPortal, PRICING_PLANS } from "./dodo";

const DEFAULT_PRODUCT_ID = process.env.DODO_PRODUCT_GOOD_MONTHLY ?? "";
const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY ?? "";
const DODO_ENVIRONMENT = process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode";

function dodoCheckoutConfigurationError(message: string) {
  throw new Error(`Dodo checkout configuration error: ${message}`);
}

export const createCheckout = action({
  args: {
    // New: productId passed directly from Hono (preferred)
    productId: v.optional(v.string()),
    // Legacy: planId string kept for backward compat
    planId: v.optional(v.string()),
    quantity: v.number(),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Resolve the DodoPayments product ID
    let dodoProductId: string;
    if (args.productId) {
      // New path — product ID passed directly from the checkout service
      dodoProductId = args.productId;
    } else if (args.planId) {
      // Legacy path — look up from the plan catalog
      const plan = PRICING_PLANS[args.planId as keyof typeof PRICING_PLANS];
      if (!plan) throw new Error(`Plan not found: ${args.planId}`);
      if (plan.pricePerUser === null) throw new Error(`Plan ${args.planId} requires contact sales`);
      dodoProductId = plan.dodoProductId || DEFAULT_PRODUCT_ID;
    } else {
      dodoProductId = DEFAULT_PRODUCT_ID;
    }
    if (!dodoProductId) {
      dodoCheckoutConfigurationError("Dodo product id is not configured for checkout.");
    }
    if (!DODO_API_KEY) {
      dodoCheckoutConfigurationError(
        `DODO_PAYMENTS_API_KEY is not configured in Convex for ${DODO_ENVIRONMENT}.`,
      );
    }

    const quantity = Math.max(1, args.quantity ?? 1);

    const checkoutPayload: {
      product_cart: { product_id: string; quantity: number }[];
      billing_currency?: string;
      return_url?: string;
      feature_flags?: { allow_discount_code?: boolean };
    } = {
      product_cart: [{ product_id: dodoProductId, quantity }],
      billing_currency: "USD",
      feature_flags: { allow_discount_code: true },
    };

    if (args.returnUrl) {
      checkoutPayload.return_url = args.returnUrl;
    }

    try {
      return await checkout(ctx, { payload: checkoutPayload });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/401|Unauthorized/i.test(message)) {
        dodoCheckoutConfigurationError(
          `Dodo rejected the checkout request for ${DODO_ENVIRONMENT}. Verify the Convex DODO_PAYMENTS_API_KEY belongs to this environment and can access product ${dodoProductId}.`,
        );
      }
      throw error;
    }
  },
});

export const getCustomerPortal = action({
  args: {},
  handler: async (ctx) => {
    return await customerPortal(ctx, {});
  },
});

export const listPlans = action({
  args: {},
  handler: async (_ctx) => {
    return PRICING_PLANS;
  },
});
