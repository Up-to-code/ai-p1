# Organization Billing, Entitlements, and AI Credits

## Ownership

- Catalog and pure policy: `@qentrah/domain-contracts/subscription-pricing`
- Durable organization state and enforcement: `apps/workspace/convex/billing`
- Signed provider ingress: `POST /dodopayments-webhook` in `apps/workspace/convex/http.ts`
- Checkout gateway: `apps/workspace/src/server/domains/billing`
- Reactive client policy and billing screen: `apps/workspace/src/domains/billing` and `/{locale}/billing`
- AI runtime enforcement: `apps/workspace/agent/hooks/billing-credits.ts`

The legacy `qentrah_workspace` plan identifier is read as Unlimited monthly. Historical payments remain readable; no destructive migration is required.

## Commercial catalog

| Plan | Billing | Core limits | Monthly AI | Advanced limits |
|---|---|---|---|---|
| Free | $0, 3 members | 5 projects, 60 MB | unavailable | no guests, webhooks, automations, custom roles, or SSO |
| Unlimited | $7 monthly / $70 yearly, 3 included seats | unlimited projects/storage | 3,000 credits | 5 guests, 10 webhooks, 1,000 automations/API calls, 1 agent link, 7-day audit |
| Business | $19 monthly / $190 yearly, 3 included seats | unlimited core resources | 10,000 credits | 5,000 automations, 10,000 API calls, 5 agent links, RBAC, Google SSO |
| Enterprise | contract | contract overrides | contract allowance | custom quotas, SAML/SCIM, 365-day audit baseline |

Additional paid seats use the plan price for the selected cycle. Included AI allowance uses UTC calendar-month windows even for annual subscriptions. Purchased credits cost $0.001 each, never expire, and remain stored when an organization falls back to Free.

## Lifecycle

1. An owner creates a local subscription or credit-purchase order with an idempotency key.
2. Hosted checkout receives metadata for the local order, organization, plan, seats, cycle, purchase kind, credits, and idempotency key.
3. Dodo signs the webhook request. The Convex adapter verifies it before invoking reconciliation.
4. Reconciliation rejects missing or mismatched organization/order metadata and records an event key before applying state.
5. A verified payment activates a subscription or grants a top-up once. UI return URLs never activate access.
6. Subscription events update provider IDs, periods, seats, scheduled cancellation, trial state, or seven-day past-due grace.
7. Refunds remove only unspent purchased credits. Consumed refunded credits leave the balance at zero and flag the payment for manual review.
8. At grace expiry or cancellation period end, policy resolves Free entitlements while retaining existing records and purchased credit history.

The former Hono `/billing/dodo/webhook` and standalone Convex webhook router were removed. They must not be reintroduced.

### Better Auth plugin boundary

The official [`@dodopayments/better-auth`](https://better-auth.com/docs/plugins/dodopayments) plugin is tracked as a provider adapter option. Its current checkout and portal APIs are centered on the authenticated user and its webhook endpoint is `/api/auth/dodopayments/webhooks`. Do not enable these endpoints alongside the Convex ingress: doing so would allow caller-supplied checkout metadata, resolve a user customer instead of the Organization subscription customer, and create two webhook authorities. Any future adoption must keep owner authorization, server-derived Organization and seat data, local-order correlation, and the single signed reconciliation path.

## AI reservation lifecycle

Eve root agents and every declared subagent share the same hook:

1. `turn.started` atomically reserves the configured maximum cost.
2. `step.completed` accumulates provider token usage.
3. `turn.completed` settles subscription credits first, then purchased credits. Provider USD cost maps with `ceil(cost × 1,000)`; missing cost conservatively settles the reservation.
4. `turn.failed` releases the reservation.

Free and inactive organizations cannot start AI turns even when a purchased balance remains. Convex mutations serialize reservations, preventing concurrent overspend.

## Enforcement boundaries

Entitlement checks occur after identity and organization authorization at Project creation, member invitations, media attachment, Automation creation/execution, partner webhooks, organization API calls, MCP agent links, custom roles, hosted checkout, and Eve execution. `getOrganizationEntitlements` is reactive UI state only; backend assertions remain authoritative.

## Operations

Required provider configuration:

- `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_ENVIRONMENT`, and Dodo webhook signing configuration
- `DODO_PRODUCT_GOOD_MONTHLY`, `DODO_PRODUCT_GOOD_YEARLY`
- `DODO_PRODUCT_BETTER_MONTHLY`, `DODO_PRODUCT_BETTER_YEARLY`
- `DODO_PRODUCT_AI_CREDITS_USD` for the one-dollar/1,000-credit product

The Dodo endpoint must use the Convex HTTP-actions origin, for example
`https://<deployment>.convex.site/dodopayments-webhook`. A
`https://<deployment>.convex.cloud/...` URL targets the functions API and will
return 404 for this webhook. Store the matching signing secret only in the
Convex deployment environment.

Use the customer portal for payment methods, invoices, and provider cancellation. Reconciliation state and local payment history remain visible from the billing screen.
