# Environment Variables

This is the canonical repo-level environment reference. For the Workspace and
Mobile cleanup manifest, see
[Workspace and Mobile environment manifest](./workspace-mobile-env-manifest.md).

## Rules

- Never commit real secrets, production tokens, refresh tokens, or client
  secrets.
- Store local values in `.env.local` files or app-specific env files ignored by
  Git.
- Store deployed app values in the matching Vercel project.
- Store Convex backend values in the matching Convex deployment.
- Values prefixed with `NEXT_PUBLIC_` or `EXPO_PUBLIC_` are bundled into client
  code and must not contain secrets.
- Clerk is the Workspace and Mobile identity provider. Workspace no longer uses
  WorkOS AuthKit or Better Auth for sign-in.

## Workspace

Workspace uses Clerk for auth and Convex for business data. The current
development Convex deployment is `bright-sheep-471`.

Production baseline:

```bash
NEXT_PUBLIC_SITE_URL=https://app.qentrah.com
SITE_URL=https://app.qentrah.com
NEXT_PUBLIC_API_URL=https://app.qentrah.com
CONVEX_DEPLOYMENT=bright-sheep-471
NEXT_PUBLIC_CONVEX_URL=https://bright-sheep-471.convex.cloud
CONVEX_URL=https://bright-sheep-471.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://bright-sheep-471.convex.site
CONVEX_SITE_URL=https://bright-sheep-471.convex.site
```

Common Workspace variables:

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Browser | Public Workspace base URL |
| `SITE_URL` | Server | Canonical Workspace URL |
| `NEXT_PUBLIC_API_URL` | Browser | Public Workspace API origin |
| `CONVEX_DEPLOYMENT` | Local/dev | Convex deployment selector |
| `NEXT_PUBLIC_CONVEX_URL` | Browser | Convex client URL |
| `CONVEX_URL` | Server | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Browser | Convex site URL |
| `CONVEX_SITE_URL` | Server | Convex site URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Browser | Clerk publishable key |
| `CLERK_SECRET_KEY` | Secret | Clerk server key |
| `CLERK_FRONTEND_API_URL` | Server/Convex | Clerk issuer domain used by Convex auth config |
| `PLATFORM_ADMIN_EMAILS` | Server | Platform admin allowlist |
| `WORKSPACE_CONVEX_BRIDGE_SECRET` | Secret | Server-only token for Hono-to-Convex partner/API resource calls |
| `ADMIN_CONVEX_SERVICE_TOKEN` | Secret | Dedicated token accepted by Workspace Convex admin functions |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Secret | Service token accepted by Workspace admin APIs |
| `PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY` | Secret | Encrypts partner webhook secrets |
| `ORGANIZATION_DATA_ENCRYPTION_KEY` | Secret | Master key for organization-scoped business data encryption |
| `PARTNER_APPS_ENABLED` | Server | Enables or disables partner app features |
| `PARTNER_OAUTH_ISSUER` | Server | Partner OAuth issuer, normally `https://app.qentrah.com` |
| `PARTNER_OAUTH_AUDIENCE` | Server | Partner API audience, normally `https://app.qentrah.com/api/v1/partner` |
| `PARTNERS_API_BASE_URL` | Server | Partners origin for catalog verification |
| `NEXT_PUBLIC_PARTNERS_AUTH_URL` | Browser/server fallback | Partners origin fallback |
| `PARTNERS_PLATFORM_SERVICE_TOKEN` | Secret | Service token for Workspace to read/verify published partner apps |

Optional Workspace integrations:

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Secret | AI model calls |
| `OPENROUTER_MODEL` | Server | Primary AI model ID |
| `OPENROUTER_FALLBACK_MODELS` | Server | Comma-separated fallback model IDs |
| `OPENROUTER_APP_NAME` | Server | AI attribution name |
| `UPLOADTHING_TOKEN` | Secret | UploadThing encoded token |
| `UPLOADTHING_SECRET` | Secret | UploadThing API secret |
| `UPLOADTHING_APP_ID` | Server | UploadThing app ID |
| `TAMARA_API_BASE_URL` | Server | Tamara API origin |
| `TAMARA_API_TOKEN` | Secret | Tamara merchant API token |
| `TAMARA_NOTIFICATION_TOKEN` | Secret | Tamara webhook verification token |
| `TAMARA_PUBLIC_KEY` | Server | Tamara merchant public key |
| `TAMARA_WEBHOOK_URL` | Server | Public Tamara webhook endpoint |
| `TAMARA_CAPTURE_MODE` | Server | `immediate` or `manual` capture behavior |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Browser | Map UI token |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser | Client Sentry DSN |
| `SENTRY_DSN` | Server | Server Sentry DSN |
| `SENTRY_UPLOAD_SOURCE_MAPS` | Build | Enables Sentry source map upload |
| `SENTRY_ORG` | Build | Sentry source map org |
| `SENTRY_PROJECT` | Build | Sentry source map project |
| `SENTRY_AUTH_TOKEN` | Secret | Sentry source map upload token |
| `NEXT_PUBLIC_QENTRAH_PERF_DEBUG` | Browser | Optional performance debug flag |

Workspace production checks reject WorkOS AuthKit variables, Better Auth
variables, Google OAuth server credentials, and old `stoic-monitor-13` Convex
URLs.

## Workspace Convex Deployment

Only set variables read by Convex functions/config in the Workspace Convex
deployment:

```bash
CLERK_FRONTEND_API_URL=<clerk-issuer-domain>
WORKSPACE_CONVEX_BRIDGE_SECRET=<secret>
ADMIN_CONVEX_SERVICE_TOKEN=<secret>
ORGANIZATION_DATA_ENCRYPTION_KEY=<secret>
PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY=<secret>
```

Do not set browser-only, Vercel-only, Mobile-only, WorkOS AuthKit, Better Auth,
or Google OAuth variables in the Workspace Convex deployment.

## Partners

Partners owns its own database and auth configuration. This cleanup does not
change Partners app env.

Production baseline:

```bash
SITE_URL=https://partners.qentrah.com
NEXT_PUBLIC_PARTNERS_AUTH_URL=https://partners.qentrah.com
BETTER_AUTH_URL=https://partners.qentrah.com
QENTRAH_WORKSPACE_API_URL=https://app.qentrah.com
```

Common Partners variables:

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `CONVEX_DEPLOYMENT` | Local/dev | Partners Convex deployment selector |
| `CONVEX_URL` | Server | Partners Convex URL |
| `CONVEX_SITE_URL` | Server | Partners Convex site URL |
| `NEXT_PUBLIC_CONVEX_URL` | Browser | Partners Convex client URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Browser | Partners Convex site URL |
| `BETTER_AUTH_SECRET` | Secret | Partners auth signing secret |
| `PARTNER_SIGNUP_BRIDGE_SECRET` | Secret | Secures sign-up bridge route |
| `PARTNERS_PLATFORM_SERVICE_TOKEN` | Secret | Allows Workspace to read/verify published apps |
| `PARTNERS_ADMIN_SERVICE_TOKEN` | Secret | Allows Admin Review to review partner apps |
| `QENTRAH_WORKSPACE_API_URL` | Server/browser as needed | Workspace origin for partner integrations |

## Admin Review

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `PARTNERS_API_BASE_URL` | Server | Partners origin for review service API calls |
| `PARTNERS_ADMIN_SERVICE_TOKEN` | Secret | Service token accepted by Partners |
| `WORKSPACE_API_BASE_URL` | Server | Optional Workspace origin for operational data |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Secret | Service token accepted by Workspace |
| `ADMIN_CONVEX_SERVICE_TOKEN` | Secret | Dedicated token used for Admin Review direct Convex access |

## Mobile

Mobile calls Workspace APIs. Mobile does not connect to Convex directly.

Production baseline:

```bash
QENTRAH_MOBILE_ENV=production
EXPO_PUBLIC_PRODUCTION_WORKSPACE_API_URL=https://app.qentrah.com
EXPO_PUBLIC_PRODUCTION_AUTH_URL=https://app.qentrah.com
EXPO_PUBLIC_PRODUCTION_CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
```

Development baseline for a physical device:

```bash
QENTRAH_MOBILE_ENV=development
EXPO_PUBLIC_DEV_WORKSPACE_API_URL=http://<your-lan-ip>:3000
EXPO_PUBLIC_DEV_AUTH_URL=http://<your-lan-ip>:3000
EXPO_PUBLIC_DEV_CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
```

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `QENTRAH_MOBILE_ENV` | Build-time | Selects development or production mobile config |
| `EXPO_PUBLIC_DEV_WORKSPACE_API_URL` | Mobile client | Development Workspace API origin |
| `EXPO_PUBLIC_DEV_AUTH_URL` | Mobile client | Development auth origin |
| `EXPO_PUBLIC_DEV_CLERK_PUBLISHABLE_KEY` | Mobile client | Development Clerk publishable key |
| `EXPO_PUBLIC_PRODUCTION_WORKSPACE_API_URL` | Mobile client | Production Workspace API origin |
| `EXPO_PUBLIC_PRODUCTION_AUTH_URL` | Mobile client | Production auth origin |
| `EXPO_PUBLIC_PRODUCTION_CLERK_PUBLISHABLE_KEY` | Mobile client | Production Clerk publishable key |

Set the real production Clerk publishable key in the EAS production
environment. The placeholder in `apps/mobile/eas.json` intentionally fails app
config validation if it is not replaced.

Mobile selected-region context comes from the active Clerk organization public
metadata. Mobile forwards the selected organization id and normalized regions to
Workspace API requests as context headers. Workspace still treats authorization
as Clerk/Convex-owned.

## Demo Partner App

Production baseline:

```bash
QENTRAH_WORKSPACE_API_URL=https://app.qentrah.com
PARTNER_APP_URL=https://demo.qentrah.com
```

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `QENTRAH_WORKSPACE_API_URL` | Server | Workspace partner authorization and resource API origin |
| `QENTRAH_CLIENT_ID` | Public/server | Partners client ID |
| `QENTRAH_CLIENT_SECRET` | Secret | Optional legacy confidential client secret |
| `PARTNER_APP_URL` | Server | Demo app public origin |
| `DEMO_ACCESS_TOKEN` | Secret | Demo unlock value |
| `SESSION_SECRET` | Secret | Cookie encryption/signing secret |

## Marketing

Production baseline:

```bash
NEXT_PUBLIC_WORKSPACE_URL=https://app.qentrah.com
NEXT_PUBLIC_PARTNERS_URL=https://partners.qentrah.com
```
