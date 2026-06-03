# Files

- `packages/domain-contracts/src/subscriptionPricing.ts`: shared pricing catalog Module for global plans, Saudi market pricing, credit packs, legacy plan mapping, and AI credit calculation.
- `apps/marketing/components/landing/pricing-03.tsx`: public Marketing pricing cards hydrated from the Saudi market adapter.
- `apps/workspace/src/components/landing/pricing-03.tsx`: public Workspace landing pricing cards hydrated from the Saudi market adapter.
- `apps/workspace/src/domains/billing/api/billing.ts`: browser Billing API wrapper and fallback overview projection using global plan ids, market, cycle, and entitlements.
- `apps/workspace/src/domains/billing/components/billing-screen.tsx`: authenticated Billing screen that displays selected plan entitlements and starts eligible checkout.
- `apps/workspace/src/server/domains/billing/services/billing.ts`: server-side billing orchestration that resolves plan selection through the market adapter before Tamara checkout.
- `apps/workspace/convex/billing/data.ts`: Convex billing data Module that maps stored plan ids to global plan, market, billing cycle, and entitlements.
- `apps/workspace/convex/billing/write.ts`: Convex billing write surface for pending payments and subscription state.
- `apps/workspace/convex/billing/usageSurface.ts`: Subscription credit ledger Module for billing windows, subscription credits, add-on credits, spend order, and usage projection.
- `apps/workspace/convex/billing/read.ts`: Convex billing read surface for subscription overview and usage gate projection.
- `apps/workspace/convex/billing/webhookProcessing.ts`: subscription activation after provider webhook capture.
- `apps/workspace/convex/schema.ts`: stores subscription, payment, and usage-meter state including optional add-on credit ledger fields.
