# Changes

## 2026-05-28 Billing View-Model Depth

- Added the browser Billing view-model Module for localized Billing/Tamara copy, price/date formatting, subscription tones, and Tamara return text/tone projection.
- Preserved Billing and Tamara return routes, checkout behavior, polling behavior, response shapes, and visible copy while removing presentation logic from screens.

## 2026-05-28 Billing Read Surface Depth

- Added `convex/billing/readSurface.ts` so latest Tamara payment ordering and subscription overview composition live behind one internal billing read Module.
- Preserved `billing/read.ts` query exports, permission checks, inactive fallback plan, subscription/payment presentation, and order lookup behavior.

## 2026-05-28 Billing Browser Request Depth

- Moved browser Billing overview, Tamara checkout, and Tamara order status calls onto the shared organization request Module for route segment encoding, JSON request construction, and fallback error behavior.
- Preserved exported Billing API function names, Tamara request payloads, inactive overview fallback behavior, and hook behavior.
- Added focused tests for inactive fallback overview and encoded Billing/Tamara routes.

## 2026-05-28 Webhook Processing Depth

- Created lifecycle docs for Workspace Tamara billing webhook processing.
- Extracted Convex webhook state handling into `convex/billing/webhookProcessing.ts`.
- Kept `billing/write:*` public Convex mutation names stable while centralizing bridge-token assertion, duplicate event recording, payment lookup, failed-event patching, payment status patching, and captured subscription activation.
- Preserved Hono webhook verification and Tamara authorise/capture orchestration in the server billing service.
