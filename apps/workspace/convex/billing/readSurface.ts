import {
  getBillingPlan,
  presentPayment,
  presentSubscription,
  SAUDI_MONTHLY_PLAN,
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
  return {
    plan: subscription ? getBillingPlan(subscription.planId) : SAUDI_MONTHLY_PLAN,
    subscription: subscription ? presentSubscription(subscription) : null,
    latestPayment: latestPayment ? presentPayment(latestPayment) : null,
  };
}
