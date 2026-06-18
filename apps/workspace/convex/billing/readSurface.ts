import {
  BILLING_PLANS,
  getBillingPlan,
  presentPayment,
  presentSubscription,
  type StoredSubscription,
  type StoredPayment,
} from "./data";

export function latestPayment(payments: StoredPayment[]) {
  return payments.sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null;
}

export function billingSubscriptionOverview(
  subscription: StoredSubscription | null,
  latestPayment: StoredPayment | null,
) {
  return {
    plan: subscription ? getBillingPlan(subscription.planId) : BILLING_PLANS.qentrah_workspace,
    subscription: subscription ? presentSubscription(subscription) : null,
    latestPayment: latestPayment ? presentPayment(latestPayment) : null,
  };
}
