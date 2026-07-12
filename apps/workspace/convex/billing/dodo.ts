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

export const PRICING_PLANS = {
  good_monthly: {
    id: "good_monthly",
    name: "Unlimited",
    billingPeriod: "monthly",
    pricePerUser: 7,
    currency: "USD",
    dodoProductId: process.env.DODO_PRODUCT_GOOD_MONTHLY ?? "",
    features: [
      "Project, asset & client workspace",
      "Standard workspace apps",
      "1 agent link",
      "Standard support",
    ],
  },
  good_yearly: { id: "good_yearly", name: "Unlimited Annual", billingPeriod: "yearly", pricePerUser: 70, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_GOOD_YEARLY ?? "", features: [] },
  better_monthly: { id: "better_monthly", name: "Business", billingPeriod: "monthly", pricePerUser: 19, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_BETTER_MONTHLY ?? "", features: [] },
  better_yearly: { id: "better_yearly", name: "Business Annual", billingPeriod: "yearly", pricePerUser: 190, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_BETTER_YEARLY ?? "", features: [] },
  qentrah_workspace: { id: "qentrah_workspace", name: "Qentrah Workspace", billingPeriod: "monthly", pricePerUser: 7, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_GOOD_MONTHLY ?? "", features: [] },
  custom_monthly: { id: "custom_monthly", name: "Custom", billingPeriod: "monthly", pricePerUser: null as null, currency: "USD", dodoProductId: "", features: [] },
  custom_yearly:  { id: "custom_yearly",  name: "Custom Annual", billingPeriod: "yearly",  pricePerUser: null as null, currency: "USD", dodoProductId: "", features: [] },
};
