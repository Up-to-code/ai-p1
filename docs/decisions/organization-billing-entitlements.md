# Organization billing is the authority for plan access and AI spend

Status: accepted — 2026-07-14

## Decision

`@qentrah/domain-contracts/subscription-pricing` owns the commercial catalog and pure status-to-access policy. `apps/workspace/convex/billing` owns organization subscription state, quota usage, payments, provider reconciliation, AI balances, reservations, and ledgers.

All write adapters authorize the record first and then call the billing entitlement policy. React visibility is never an authorization boundary. New organizations have no paid subscription record and therefore resolve to Free.

DodoPayments enters the system only through its signed Convex webhook. Checkout return pages are informational. Provider metadata must correlate to an existing organization-owned local order, and event keys make grants and state transitions idempotent.

The official Better Auth DodoPayments plugin is an evaluated integration option, not the billing authority. Its current checkout endpoints accept caller-provided reference metadata, and its portal/customer model is tied to the authenticated Better Auth user. Qentrah subscriptions instead belong to an Organization and require owner authorization, server-derived seat quantity, and a pre-existing local order. Enabling the plugin webhook would also introduce a second provider ingress. Qentrah therefore uses the official `@dodopayments/convex` adapter for signed webhooks and keeps provider checkout/portal calls behind the organization billing gateway. The Better Auth plugin may replace those adapters only when it can preserve these invariants without exposing its direct user-owned endpoints.

AI uses reservation and settlement instead of post-completion recording. Included allowance resets on a UTC monthly window independently of the provider subscription cycle; purchased credits are a non-expiring balance and are consumed after included credits.

## Consequences

- Catalog changes require contract tests, not edits to workspace or Convex copies.
- Existing records remain editable after downgrade, but capacity-increasing and paid-only operations fail closed.
- Eve root and subagent turns cannot bypass the same credit gate.
- Provider failure or missing correlation never grants plan access or credits.
- Better Auth authentication never implies ownership of an Organization subscription or Dodo customer.
- Enterprise behavior is expressed as persisted overrides over the canonical baseline.
