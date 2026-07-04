# Tests

## Existing Tests

| Test file | What it covers |
|---|---|
| `auth-handoff.test.ts` | Handoff create/encode/decode with TTL |
| `auth-route-source.test.ts` | Source structure (no Clerk prebuilt UI imports) |
| `auth-callback-url.test.ts` | Callback URL normalization |
| `clerk-auth-utils.test.ts` | Error message localization |

## Missing Tests (to create)

### Bit 1 — Google OAuth
- `use-headless-clerk-auth.test.ts` — verify redirectUrl is absolute, redirectUrlComplete is absolute, social sign-in creates correct strategy
- `auth-callback-client.test.ts` — verify SSO callback page handles Clerk URL params

### Bit 2 — Middleware
- `proxy.test.ts` — verify protected routes redirect, public routes pass, organization sync params

### Bit 3 — Convex Permissions
- `convex/permissions/access.test.ts` — verify getOrganizationRole returns correct role
- `convex/organizations/profile/access.test.ts` — verify getCapabilities returns correct permissions based on role

### Bit 4 — Organization Readiness
- `organization-context.test.ts` — verify orgId resolved correctly, timeout removed

### Integration
- `auth-flow.test.ts` — full flow: sign-in → choose-org → workspace ready
