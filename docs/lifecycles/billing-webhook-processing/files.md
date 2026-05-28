# Files

- `apps/workspace/src/server/domains/billing/handlers/billing.ts`: Hono request boundary for Tamara checkout, order lookup, and webhook receipt.
- `apps/workspace/src/domains/billing/api/billing.ts`: browser Billing API wrapper for subscription overview, Tamara checkout, order lookup, and inactive fallback overview.
- `apps/workspace/src/domains/billing/billing-view-model.ts`: browser Billing view-model Module for localized billing copy, price/date labels, subscription tones, and Tamara return presentation.
- `apps/workspace/src/server/domains/billing/services/billing.ts`: server-side Tamara orchestration, webhook token validation, authorisation/capture calls, and Convex bridge calls.
- `apps/workspace/src/server/domains/billing/services/tamara-client.ts`: Tamara API client and checkout/capture payload construction.
- `apps/workspace/src/server/domains/billing/services/tamara-config.ts`: Tamara runtime configuration and required env validation.
- `apps/workspace/src/server/domains/billing/services/tamara-webhook-token.ts`: Tamara notification token verification.
- `apps/workspace/convex/billing/write.ts`: stable Convex mutation facade for checkout and webhook state writes.
- `apps/workspace/convex/billing/webhookProcessing.ts`: internal Convex webhook-processing Module for bridge-token assertion, idempotent event storage, payment lookup, status patching, and subscription activation.
- `apps/workspace/convex/billing/read.ts`: subscription and Tamara payment read surface.
- `apps/workspace/convex/billing/readSurface.ts`: internal billing read Module for latest-payment ordering and subscription overview composition.
