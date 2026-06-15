# Phase 1 MVP Implementation Guide: DodoPayments Integration

## Overview
This guide documents the Phase 1 MVP implementation of Qentrah with DodoPayments integration at **$4.99/user/month** base pricing.

## Architecture
- **Backend**: Convex + DodoPayments component
- **Pricing Models**: 3-tier (Starter, Pro, Agency) with monthly/yearly options
- **Webhook Handling**: Automatic payment and subscription event processing
- **Database**: PostgreSQL-compatible schema with customer, payment, and subscription tables

## Setup Instructions

### 1. Install DodoPayments Package
```bash
cd apps/workspace
npm install @dodopayments/convex
```

### 2. Set Environment Variables in Convex Dashboard
```bash
npx convex dashboard
```

Add these variables in **Settings → Environment Variables**:
- `DODO_PAYMENTS_API_KEY=your-api-key` (from DodoPayments account)
- `DODO_PAYMENTS_ENVIRONMENT=test_mode` (or `live_mode` for production)
- `DODO_PAYMENTS_WEBHOOK_SECRET=your-webhook-secret` (for webhook verification)

### 3. Update Convex Configuration ✅
Already updated in `convex/convex.config.ts`:
```typescript
import dodopayments from "@dodopayments/convex/convex.config";
app.use(dodopayments);
```

### 4. Database Schema ✅
New tables added to `convex/schema.ts`:
- `dodoCustomers` - Maps auth users to DodoPayments customers
- `dodoPayments` - Payment records with status tracking
- `dodoSubscriptions` - Active subscription records

### 5. Backend Functions ✅

#### Payment Actions (`convex/billing/payments.ts`)
- `createCheckout(planId, quantity, returnUrl)` - Create checkout session
- `getCustomerPortal(returnUrl)` - Get customer self-service portal URL
- `listPlans()` - Get available pricing plans

#### Customer Functions (`convex/billing/customers.ts`)
- `getCurrentUserCustomer()` - Fetch current user's customer record
- `upsertCustomer(authId, email, dodoCustomerId)` - Create/update customer

#### Webhook Handlers (`convex/http.ts`)
Automatically processes:
- `onPaymentSucceeded` - Record successful payment
- `onPaymentFailed` - Log payment failures
- `onSubscriptionActive` - Activate subscription
- `onSubscriptionCanceled` - Cancel subscription
- `onSubscriptionUpdated` - Update subscription status

### 6. Frontend Component ✅
Pricing page located at `src/components/pricing/PricingPage.tsx`:
- Display 3 pricing tiers
- Quantity selector (number of users)
- Monthly/yearly toggle
- Real-time total calculation
- Checkout button integration

## Pricing Structure

| Plan | Monthly | Yearly |
|------|---------|--------|
| **Starter** | $4.99/user | $49.90/user |
| **Pro** | $9.99/user | $99.90/user |
| **Agency** | $14.99/user | $149.90/user |

### Plan Features

**Starter ($4.99/user)**
- Up to 5 projects
- Up to 50 tasks
- Basic CRM
- Email support

**Pro ($9.99/user)**
- Unlimited projects
- Unlimited tasks
- Advanced CRM
- AI-powered workflows
- Priority support

**Agency ($14.99/user)**
- Everything in Pro
- Team collaboration
- Client portal
- Advanced reporting
- Dedicated support
- Custom integrations

## Integration Flow

### Customer Checkout Flow
1. User selects plan + quantity on pricing page
2. Frontend calls `createCheckout` action
3. Convex queries user by auth ID
4. DodoPayments generates checkout URL
5. User redirected to DodoPayments hosted checkout
6. Payment processed
7. Webhook received and processed
8. Subscription activated in database

### Webhook Processing Flow
1. DodoPayments sends webhook to `/dodopayments-webhook`
2. Signature verified automatically by component
3. Event-specific handler executed
4. Data persisted to database via mutation
5. Customer/subscription status updated

## TODO for Full Implementation

### Backend
- [ ] Implement subscription management (pause, resume, cancel)
- [ ] Create team/seat management (add/remove users)
- [ ] Implement usage tracking and metering
- [ ] Create billing portal mutations
- [ ] Add refund/credit handling
- [ ] Implement dunning management for failed payments

### Frontend
- [ ] Create `/pricing` route
- [ ] Add customer portal redirect
- [ ] Implement billing history page
- [ ] Create subscription management page
- [ ] Add payment method management
- [ ] Implement invoice download

### Operations
- [ ] Set up webhook endpoint in DodoPayments dashboard
- [ ] Configure test mode credentials
- [ ] Test complete checkout flow
- [ ] Test webhook events (payment, subscription lifecycle)
- [ ] Configure live mode credentials
- [ ] Set up monitoring/alerts for failed payments

## Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Verify Convex functions
npx convex dev

# Test in test_mode with DodoPayments test cards
```

### Test Cards
DodoPayments provides test cards in test mode. Check their docs for available test scenarios.

## Environment Setup Checklist
- [ ] DodoPayments account created
- [ ] API key obtained
- [ ] Webhook secret obtained
- [ ] Environment variables set in Convex dashboard
- [ ] Package installed
- [ ] Database migrations applied
- [ ] Frontend routes created
- [ ] Webhook endpoint configured
- [ ] Test mode verified
- [ ] Live mode ready

## Files Modified/Created

### Created
- `convex/billing/dodo.ts` - DodoPayments configuration and pricing
- `convex/billing/customers.ts` - Customer management functions
- `convex/billing/payments.ts` - Payment action functions
- `convex/billing/webhookMutations.ts` - Webhook event mutations
- `src/components/pricing/PricingPage.tsx` - Pricing page UI

### Modified
- `convex/convex.config.ts` - Added DodoPayments component
- `convex/http.ts` - Added webhook handlers
- `convex/schema.ts` - Added DodoPayments tables

## API Reference

### Actions

#### `createCheckout`
Create a checkout session for subscription purchase
```typescript
await createCheckout({
  planId: "pro_monthly",
  quantity: 2,
  returnUrl: "https://qentrah.com/dashboard"
});
// Returns: { checkout_url: "https://dodopayments.com/checkout/..." }
```

#### `getCustomerPortal`
Get customer self-service portal URL
```typescript
await getCustomerPortal({
  returnUrl: "https://qentrah.com/account"
});
// Returns: { portal_url: "https://dodopayments.com/portal/..." }
```

#### `listPlans`
Get all available pricing plans
```typescript
await listPlans();
// Returns: { starter_monthly, starter_yearly, pro_monthly, ... }
```

### Queries

#### `getCurrentUserCustomer`
Fetch current authenticated user's customer record
```typescript
const customer = await getCurrentUserCustomer();
// Returns: { authId, email, dodoCustomerId, createdAt, updatedAt }
```

## Next Steps

1. **Verify Setup**: Run `npm run dev` and check Convex logs for any errors
2. **Test Checkout**: Navigate to pricing page and test checkout flow
3. **Monitor Webhooks**: Watch Convex logs for webhook processing
4. **Deploy**: Push to staging environment and test live mode
5. **Launch**: Configure live DodoPayments credentials and launch

## Support

For DodoPayments documentation: https://docs.dodopayments.com/
For Convex documentation: https://docs.convex.dev/
