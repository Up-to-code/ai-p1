import { DodoPayments, DodoPaymentsClientConfig } from "@dodopayments/convex";
import { components } from "../_generated/api";
import { internal } from "../_generated/api";

/**
 * DodoPayments Configuration
 * Pricing: $4.99/user/month (Individual), $9.99/user/month (Team), $19.99/user/month (Enterprise)
 */

export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Use ctx.runQuery() to lookup customer from your database
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

// Export the API methods for use in your app
export const { checkout, customerPortal } = dodo.api();

/**
 * Pricing Plans
 */
export const PRICING_PLANS = {
  individual_monthly: {
    id: "individual_monthly",
    name: "Individual",
    billingPeriod: "monthly",
    pricePerUser: 4.99,
    currency: "USD",
    features: [
      "Up to 5 projects",
      "Up to 50 tasks",
      "Basic CRM",
      "Email support",
    ],
  },
  individual_yearly: {
    id: "individual_yearly",
    name: "Individual Annual",
    billingPeriod: "yearly",
    pricePerUser: 49.90, // 10 months worth = $4.99 * 10
    currency: "USD",
    features: [
      "Up to 5 projects",
      "Up to 50 tasks",
      "Basic CRM",
      "Email support",
    ],
  },
  team_monthly: {
    id: "team_monthly",
    name: "Team",
    billingPeriod: "monthly",
    pricePerUser: 9.99,
    currency: "USD",
    features: [
      "Unlimited projects",
      "Unlimited tasks",
      "Advanced CRM",
      "AI-powered workflows",
      "Priority support",
    ],
  },
  team_yearly: {
    id: "team_yearly",
    name: "Team Annual",
    billingPeriod: "yearly",
    pricePerUser: 99.90, // 10 months worth = $9.99 * 10
    currency: "USD",
    features: [
      "Unlimited projects",
      "Unlimited tasks",
      "Advanced CRM",
      "AI-powered workflows",
      "Priority support",
    ],
  },
  enterprise_monthly: {
    id: "enterprise_monthly",
    name: "Enterprise",
    billingPeriod: "monthly",
    pricePerUser: 19.99,
    currency: "USD",
    features: [
      "Everything in Team",
      "Team collaboration",
      "Client portal",
      "Advanced reporting",
      "Dedicated support",
      "Custom integrations",
    ],
  },
  enterprise_yearly: {
    id: "enterprise_yearly",
    name: "Enterprise Annual",
    billingPeriod: "yearly",
    pricePerUser: 199.90, // 10 months worth = $19.99 * 10
    currency: "USD",
    features: [
      "Everything in Team",
      "Team collaboration",
      "Client portal",
      "Advanced reporting",
      "Dedicated support",
      "Custom integrations",
    ],
  },
};
