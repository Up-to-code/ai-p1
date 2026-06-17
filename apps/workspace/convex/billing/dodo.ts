import { DodoPayments, DodoPaymentsClientConfig } from "@dodopayments/convex";
import { components } from "../_generated/api";
import { internal } from "../_generated/api";

/**
 * DodoPayments Configuration
 * Pricing: $7/user/month (Good), $19/user/month (Better), Custom (Contact Sales)
 */

export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const customer = await ctx.runQuery(internal.billing.customers.getByAuthId, {
      authId: identity.subject,
    });

    if (!customer) {
      return null;
    }

    return {
      dodoCustomerId: customer.dodoCustomerId,
    };
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode") as
    | "test_mode"
    | "live_mode",
} as DodoPaymentsClientConfig);

export const { checkout, customerPortal } = dodo.api();

export const PRICING_PLANS = {
  good_monthly: {
    id: "good_monthly",
    name: "Good",
    billingPeriod: "monthly",
    pricePerUser: 7,
    currency: "USD",
    features: [
      "Project, asset, and client workspace",
      "Free setup phase included",
      "Core organization roles",
      "Limited apps and integrations",
    ],
  },
  good_yearly: {
    id: "good_yearly",
    name: "Good Annual",
    billingPeriod: "yearly",
    pricePerUser: 70,
    currency: "USD",
    features: [
      "Project, asset, and client workspace",
      "Free setup phase included",
      "Core organization roles",
      "Limited apps and integrations",
    ],
  },
  better_monthly: {
    id: "better_monthly",
    name: "Better",
    billingPeriod: "monthly",
    pricePerUser: 19,
    currency: "USD",
    features: [
      "Everything in Good",
      "AI agents and workflows",
      "3 included AI credit cards",
      "Priority support",
    ],
  },
  better_yearly: {
    id: "better_yearly",
    name: "Better Annual",
    billingPeriod: "yearly",
    pricePerUser: 190,
    currency: "USD",
    features: [
      "Everything in Good",
      "AI agents and workflows",
      "3 included AI credit cards",
      "Priority support",
    ],
  },
  custom_monthly: {
    id: "custom_monthly",
    name: "Custom",
    billingPeriod: "monthly",
    pricePerUser: null,
    currency: "USD",
    features: [
      "Custom AI credit cards",
      "Custom integrations",
      "Custom organization setup",
      "Dedicated onboarding",
    ],
  },
  custom_yearly: {
    id: "custom_yearly",
    name: "Custom Annual",
    billingPeriod: "yearly",
    pricePerUser: null,
    currency: "USD",
    features: [
      "Custom AI credit cards",
      "Custom integrations",
      "Custom organization setup",
      "Dedicated onboarding",
    ],
  },
};
