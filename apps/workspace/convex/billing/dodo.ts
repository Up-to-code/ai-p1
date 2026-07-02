// TODO: Re-enable when dodopayments component is properly generated
// import { DodoPayments, DodoPaymentsClientConfig } from "@dodopayments/convex";
// import { components } from "../_generated/api";
// import { internal } from "../_generated/api";

/**
 * DodoPayments Configuration
 * Single plan: Qentrah Workspace — $6.99/user/month
 * Product ID: pdt_0NhGI8pfoyfuPWt0TLZ1x
 * Quantity = number of seats. Add-ons are associated on the product in DodoPay.
 */

// export const dodo = new DodoPayments(components.dodopayments, {
//   identify: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       return null;
//     }

//     const customer = await ctx.runQuery(internal.billing.customers.getByAuthId, {
//       authId: identity.subject,
//     });

//     if (!customer) {
//       return null;
//     }

//     return {
//       dodoCustomerId: customer.dodoCustomerId,
//     };
//   },
//   apiKey: process.env.DODO_PAYMENTS_API_KEY!,
//   environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode") as
//     | "test_mode"
//     | "live_mode",
// } as DodoPaymentsClientConfig);

// export const { checkout, customerPortal } = dodo.api();

export const dodo = null as any;
export const checkout = null as any;
export const customerPortal = null as any;

export const PRICING_PLANS = {
  // Single active plan
  qentrah_workspace: {
    id: "qentrah_workspace",
    name: "Qentrah Workspace",
    billingPeriod: "monthly",
    pricePerUser: 6.99,
    currency: "USD",
    dodoProductId: "pdt_0NhGI8pfoyfuPWt0TLZ1x",
    features: [
      "Project, asset & client workspace",
      "AI agents & workflows",
      "All apps & integrations",
      "Priority support",
      "Included AI credits",
      "Flexible seat add-ons",
    ],
  },
  // Legacy plan entries — kept so existing stored planId values don't break
  good_monthly: { id: "good_monthly", name: "Good", billingPeriod: "monthly", pricePerUser: 7, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_GOOD_MONTHLY ?? "good_monthly", features: [] },
  good_yearly:  { id: "good_yearly",  name: "Good Annual", billingPeriod: "yearly",  pricePerUser: 70, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_GOOD_YEARLY ?? "good_yearly", features: [] },
  better_monthly: { id: "better_monthly", name: "Better", billingPeriod: "monthly", pricePerUser: 19, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_BETTER_MONTHLY ?? "better_monthly", features: [] },
  better_yearly:  { id: "better_yearly",  name: "Better Annual", billingPeriod: "yearly",  pricePerUser: 190, currency: "USD", dodoProductId: process.env.DODO_PRODUCT_BETTER_YEARLY ?? "better_yearly", features: [] },
  custom_monthly: { id: "custom_monthly", name: "Custom", billingPeriod: "monthly", pricePerUser: null as null, currency: "USD", dodoProductId: "", features: [] },
  custom_yearly:  { id: "custom_yearly",  name: "Custom Annual", billingPeriod: "yearly",  pricePerUser: null as null, currency: "USD", dodoProductId: "", features: [] },
};
