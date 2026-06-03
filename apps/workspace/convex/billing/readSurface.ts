import {
  defaultBillingPlan,
  getBillingPlan,
  presentPayment,
  presentSubscription,
  type StoredSubscription,
  type StoredTamaraPayment,
} from "./data";

export function latestTamaraPayment(payments: StoredTamaraPayment[]) {
  return payments.sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null;
}

export function billingSubscriptionOverview(
  subscription: StoredSubscription | null,
  latestPayment: StoredTamaraPayment | null,
) {
  const plan = subscription ? getBillingPlan(subscription.planId) : defaultBillingPlan();
  return {
    plan,
    subscription: subscription ? presentSubscription(subscription) : null,
    latestPayment: latestPayment ? presentPayment(latestPayment) : null,
    entitlements: plan.entitlements,
  };
}
