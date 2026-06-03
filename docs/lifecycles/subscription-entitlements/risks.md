# Risks

- Do not hard-code Saudi prices, Tamara eligibility, or billing periods in UI, Hono, or Convex callers. Use the shared pricing Module.
- Do not meter AI usage in currency. AI usage must be normalized to credits so market currencies can vary independently.
- Keep legacy `saudi_monthly` and `saudi_yearly` ids mapped until all stored subscriptions and inbound links are migrated.
- Custom plans can be displayed publicly, but checkout should remain contact-sales unless a market adapter explicitly enables a provider.
- Provider-specific failures must not corrupt subscription entitlement state.

