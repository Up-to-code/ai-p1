import { DodoPayments, type DodoPaymentsClientConfig } from "@dodopayments/convex";
import { components, internal } from "../_generated/api";

/**
 * DodoPayments Configuration
 * Product IDs are environment-specific. Configure:
 * - DODO_PRODUCT_GOOD_MONTHLY
 * - DODO_PRODUCT_GOOD_YEARLY
 * - DODO_PRODUCT_BETTER_MONTHLY
 * - DODO_PRODUCT_BETTER_YEARLY
 */

export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const customer = await ctx.runQuery(internal.billing.customers.getByAuthId, {
      authId: identity.subject,
    });

    if (!customer?.dodoCustomerId) return null;

    return {
      dodoCustomerId: customer.dodoCustomerId,
    };
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY ?? "",
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode") as
    | "test_mode"
    | "live_mode",
} as DodoPaymentsClientConfig);

export const { checkout, customerPortal } = dodo.api();
