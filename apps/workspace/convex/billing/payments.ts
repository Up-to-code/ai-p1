import { action } from "../_generated/server";
import { v } from "convex/values";
import { checkout, customerPortal } from "./dodo";
import { BILLING_PLANS } from "./data";

const DEFAULT_PRODUCT_ID = process.env.DODO_PRODUCT_GOOD_MONTHLY ?? "";
const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY ?? "";
const DODO_ENVIRONMENT = process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode";

function dodoCheckoutConfigurationError(message: string) {
  throw new Error(`Dodo checkout configuration error: ${message}`);
}

export const createCheckout = action({
  args: {
    productId: v.string(),
    quantity: v.number(),
    returnUrl: v.optional(v.string()),
    metadata: v.object({
      localOrderId: v.string(),
      organizationId: v.string(),
      planId: v.string(),
      seats: v.number(),
      billingCycle: v.string(),
      purchaseKind: v.union(v.literal("subscription"), v.literal("credit_purchase")),
      credits: v.optional(v.number()),
      idempotencyKey: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const dodoProductId = args.productId || DEFAULT_PRODUCT_ID;
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
      metadata: Record<string, string>;
    } = {
      product_cart: [{ product_id: dodoProductId, quantity }],
      billing_currency: "USD",
      feature_flags: { allow_discount_code: true },
      metadata: {
        localOrderId: args.metadata.localOrderId,
        organizationId: args.metadata.organizationId,
        planId: args.metadata.planId,
        seats: String(args.metadata.seats),
        billingCycle: args.metadata.billingCycle,
        purchaseKind: args.metadata.purchaseKind,
        credits: String(args.metadata.credits ?? 0),
        idempotencyKey: args.metadata.idempotencyKey,
      },
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
  handler: async () => {
    return BILLING_PLANS;
  },
});
