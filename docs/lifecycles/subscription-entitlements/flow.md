# Flow

1. Public pricing renders Good, Better, and Custom cards from localized copy plus the shared Saudi market pricing adapter.
2. A billing link carries a stable selection key such as `good_yearly` or `better_monthly`.
3. Workspace Billing normalizes selection keys and legacy `saudi_monthly` / `saudi_yearly` ids through the shared pricing Module.
4. Server billing resolves the selected global plan, market, billing cycle, provider eligibility, amount, and entitlements before creating checkout state.
5. Tamara is provider-specific and only starts for eligible Saudi yearly variants.
6. Convex stores normalized subscription records with plan id, market id, billing cycle, provider payment state, and period dates.
7. Usage enforcement points should read entitlements from the resolved subscription before expensive AI, app, API-key, or agent-link work runs.
8. Usage gates project the active billing window through the Subscription credit ledger, spending included subscription credits before add-on card credits.
9. Usage writes persist subscription usage and add-on usage separately while preserving the aggregate usage projection for callers.
