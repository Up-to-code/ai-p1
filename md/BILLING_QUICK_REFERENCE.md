# Billing System Quick Reference

## Pricing at a Glance

```
STARTER ($4.99/user)
├─ 5 projects max
├─ 50 tasks max
├─ Basic CRM
└─ Email support

PRO ($9.99/user) ⭐
├─ Unlimited projects
├─ Unlimited tasks
├─ Advanced CRM
├─ AI workflows
└─ Priority support

AGENCY ($14.99/user)
├─ Everything in Pro
├─ Team collaboration
├─ Client portal
├─ Advanced reporting
├─ Dedicated support
└─ Custom integrations
```

## File Structure

```
convex/
├── billing/
│   ├── dodo.ts                 # Configuration + pricing plans
│   ├── customers.ts            # Customer management
│   ├── payments.ts             # Checkout + portal actions
│   ├── webhookMutations.ts     # Event persistence
│   └── [existing files...]
├── http.ts                     # ✨ Webhook handlers (updated)
├── schema.ts                   # ✨ 3 new tables added
└── convex.config.ts            # ✨ DodoPayments component added

src/
└── components/
    └── pricing/
        └── PricingPage.tsx     # ✨ Pricing UI component
```

## Key Concepts

### Pricing Plans
- 3 tiers: Starter, Pro, Agency
- Each tier has monthly/yearly billing
- Per-user pricing model
- Yearly saves 1 month (10-month cost for 12-month period)

### Customer Lifecycle
1. **Signup**: User creates account (no payment yet)
2. **Selection**: User selects plan + quantity
3. **Checkout**: User redirected to DodoPayments
4. **Payment**: DodoPayments processes card
5. **Webhook**: We receive confirmation
6. **Activation**: Subscription activated in DB
7. **Self-Service**: Customer can manage via portal anytime

### Webhook Events
```
Payment Flow:
├─ onPaymentSucceeded → recordPayment()
└─ onPaymentFailed → recordPaymentFailure()

Subscription Lifecycle:
├─ onSubscriptionActive → recordSubscription(status: "active")
├─ onSubscriptionUpdated → recordSubscription(status: updated)
└─ onSubscriptionCanceled → recordSubscription(status: "canceled")
```

## Common Tasks

### Add a Checkout Button
```typescript
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

function CheckoutButton() {
  const createCheckout = useAction(api.billing.payments.createCheckout);
  
  const handleClick = async () => {
    const result = await createCheckout({
      planId: "pro_monthly",
      quantity: 1,
      returnUrl: window.location.href,
    });
    window.location.href = result.checkout_url;
  };
  
  return <button onClick={handleClick}>Upgrade to Pro</button>;
}
```

### Display Customer Portal
```typescript
function BillingSettings() {
  const getPortal = useAction(api.billing.payments.getCustomerPortal);
  
  const handlePortal = async () => {
    const result = await getPortal({
      returnUrl: window.location.href,
    });
    window.location.href = result.portal_url;
  };
  
  return <button onClick={handlePortal}>Manage Billing</button>;
}
```

### Check Current Subscription
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function Dashboard() {
  const customer = useQuery(api.billing.customers.getCurrentUserCustomer);
  
  if (!customer) return <div>Not subscribed</div>;
  
  return (
    <div>
      <p>Customer: {customer.email}</p>
      <p>Dodo ID: {customer.dodoCustomerId}</p>
      <p>Joined: {new Date(customer.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
```

## Database Schema

### `dodoCustomers`
```
{
  _id: Id,
  authId: string,
  email: string,
  dodoCustomerId?: string,
  createdAt: number,
  updatedAt: number
}
Indexes: by_auth_id, by_dodo_customer_id, by_email
```

### `dodoPayments`
```
{
  _id: Id,
  paymentId: string,
  dodoCustomerId: string,
  customerEmail: string,
  amount: number,
  currency: string,
  status: string,
  productIds: string[],
  failureReason?: string,
  metadata: string,
  createdAt: number
}
Indexes: by_payment_id, by_dodo_customer_id, by_status, by_created
```

### `dodoSubscriptions`
```
{
  _id: Id,
  subscriptionId: string,
  dodoCustomerId: string,
  planId: string,
  status: string,
  currentPeriodStart?: number,
  currentPeriodEnd?: number,
  metadata: string,
  createdAt: number,
  updatedAt: number
}
Indexes: by_subscription_id, by_dodo_customer_id, by_status, by_updated
```

## Environment Variables Required

```bash
# Required in Convex Dashboard Settings → Environment Variables
DODO_PAYMENTS_API_KEY=pk_test_xxxxx  # Get from DodoPayments
DODO_PAYMENTS_ENVIRONMENT=test_mode  # or live_mode
DODO_PAYMENTS_WEBHOOK_SECRET=whsec_xxxxx  # For webhook verification
```

## Testing Checklist

- [ ] User can select plan on pricing page
- [ ] Quantity selector works (1+ users)
- [ ] Total price calculates correctly
- [ ] Checkout button redirects to DodoPayments
- [ ] Payment succeeds with test card
- [ ] Webhook received and processed
- [ ] Customer record created
- [ ] Subscription record created
- [ ] Customer can access portal
- [ ] Portal shows correct subscription
- [ ] Cancel subscription works
- [ ] Failed payment handled gracefully

## Troubleshooting

### Webhook Not Received
1. Check webhook URL in DodoPayments dashboard: `https://yourapp.com/dodopayments-webhook`
2. Verify `DODO_PAYMENTS_WEBHOOK_SECRET` is set
3. Check Convex logs for errors

### Checkout URL Not Working
1. Verify `DODO_PAYMENTS_API_KEY` is correct
2. Check environment is set to correct mode (test_mode for local)
3. Ensure plan IDs match exactly

### Customer Not Found
1. Ensure user is authenticated before checkout
2. Check that customer record was created via webhook
3. Verify auth ID matches between auth system and customer record

## Rollout Plan

### Phase 1: Launch (Week 1)
- Deploy billing system in test mode
- Test end-to-end checkout flow
- Verify webhook processing
- Monitor error logs

### Phase 2: Early Access (Week 2-3)
- Limited signup with test cards
- Beta customers on selected plans
- Gather feedback

### Phase 3: General Availability (Week 4+)
- Switch to live mode
- Full pricing page launch
- Marketing campaign
- 24/7 billing support monitoring

## Resources

- **DodoPayments Docs**: https://docs.dodopayments.com/
- **Convex Docs**: https://docs.convex.dev/
- **Component Docs**: https://docs.dodopayments.com/developer-resources/convex-component
- **Implementation Guide**: `PHASE_1_IMPLEMENTATION.md`
