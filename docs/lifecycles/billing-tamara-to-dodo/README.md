# Billing: Tamara → DodoPayments Migration

## Purpose
Replace the legacy Tamara BNPL billing integration with DodoPayments subscription billing across the entire stack.

## Owner App/Package
- `apps/workspace` (server-side billing, API handlers, UI components)
- `apps/workspace/convex` (Convex functions, webhooks, data layer)

## Entrypoints
- **Server-side billing service**: `src/server/domains/billing/services/billing.ts`
- **HTTP handlers**: `src/server/domains/billing/handlers/billing.ts`
- **Validation schema**: `src/server/domains/billing/validation/billing.schema.ts`
- **Convex billing functions**: `convex/billing/*`
- **Client-side billing API**: `src/domains/billing/api/billing.ts`

## Current Status
Migration completed. All billing systems now use DodoPayments with $7/user/month (Good), $19/user/month (Better), Custom (Contact Sales) pricing in USD.

## Key Changes
1. Plan IDs: migrated from legacy naming to `good_monthly`/`good_yearly`/`better_monthly`/`better_yearly`/`custom_monthly`/`custom_yearly`
2. Currency: SAR → USD
3. Payment provider: Tamara BNPL → DodoPayments subscriptions
4. Webhook handling: Tamara webhooks → DodoPayments webhooks
5. Database tables: `tamaraPayments` → `dodoPayments`, `tamaraWebhookEvents` → `dodoWebhookEvents`

## Files Changed
- `convex/billing/data.ts` - Plan definitions and types
- `convex/billing/validators.ts` - Convex validators
- `convex/billing/read.ts` - Read queries
- `convex/billing/write.ts` - Write mutations
- `convex/billing/readSurface.ts` - Read surface functions
- `convex/billing/webhookProcessing.ts` - Webhook processing
- `convex/billing/webhookMutations.ts` - Webhook mutations
- `convex/billing/webhooks.ts` - Webhook routes
- `convex/billing/payments.ts` - Checkout actions
- `convex/schema.ts` - Schema definitions
- `src/server/domains/billing/services/billing.ts` - Server-side billing service
- `src/server/domains/billing/handlers/billing.ts` - HTTP handlers
- `src/server/domains/billing/validation/billing.schema.ts` - Validation schemas
- `src/server/domains/billing/routing.ts` - Router configuration
- `src/server/domains/organization/routing/router.ts` - Organization router

## Risks
- DodoPayments SDK API has changed significantly; webhook handlers use `customer.customer_id` instead of `customer_id`
- Schema migration required for existing data in `tamaraPayments` table
- Legacy Tamara files still exist in `src/server/domains/billing/services/tamara-*` but are no longer imported

## Rollback
To rollback, restore the previous versions of all changed files and revert schema changes.
