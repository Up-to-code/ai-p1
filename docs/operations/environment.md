# Environment Variables

This is the canonical repo-level environment reference. For the full setup
walkthrough, see [Setup and configuration](./setup-and-configuration.md).

## Rules

- Never commit real secrets, production tokens, refresh tokens, or client
  secrets.
- Store local values in `.env.local` files or app-specific env files ignored by
  Git.
- Store deployed app values in the matching Vercel project.
- Store Convex backend values in the matching Convex deployment.
- Values prefixed with `NEXT_PUBLIC_` are visible to browser code.
- OAuth access tokens, refresh tokens, service tokens, and client secrets must
  stay server-side.

## External Credential Sources

| Service | What it provides | Link |
| --- | --- | --- |
| Vercel | App deployment env variables | [Vercel environment variables](https://vercel.com/docs/environment-variables) |
| Vercel CLI | Pulling and managing env from the terminal | [Vercel CLI env](https://vercel.com/docs/cli/env) |
| Convex | Backend deployment env variables | [Convex environment variables](https://docs.convex.dev/production/environment-variables) |
| WorkOS | AuthKit, Organizations, API Keys, and webhooks | [WorkOS docs](https://workos.com/docs) |
| UploadThing | Upload app ID, secret, token | [UploadThing docs](https://docs.uploadthing.com) |
| OpenRouter | AI model API keys | [OpenRouter keys](https://openrouter.ai/settings/keys) |
| Sentry | DSN and source map upload token | [Sentry Next.js docs](https://docs.sentry.io/platforms/javascript/guides/nextjs) |
| Google Cloud | OAuth client ID and secret | [Google credentials](https://console.cloud.google.com/apis/credentials) |
| Mapbox | Public map access token | [Mapbox tokens](https://account.mapbox.com/access-tokens) |

## Cross-App Integration Variables

Production domain defaults:

| Surface | URL |
| --- | --- |
| Marketing | `https://qentrah.com` |
| Workspace | `https://app.qentrah.com` |
| Partners | `https://partners.qentrah.com` |

| Variable | Used by | Required when | Purpose |
| --- | --- | --- | --- |
| `QENTRAH_WORKSPACE_API_URL` | Partners, Demo Partner App | Calling Workspace partner authorization and resource APIs | Canonical Workspace origin |
| `PARTNERS_API_BASE_URL` | Admin Review, Workspace | Reviewing and reading published partner apps | Partners origin for admin/platform service APIs |
| `PARTNERS_ADMIN_SERVICE_TOKEN` | Admin Review, Partners | Reviewing partner apps | Service token for Partners admin APIs |
| `PARTNERS_PLATFORM_SERVICE_TOKEN` | Partners, Workspace | Published catalog reads and authorization verification | Service token for Partners platform APIs |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Admin Review, Workspace | Workspace operational data and transition admin routes | Service token accepted by Workspace admin APIs |
| `ADMIN_CONVEX_SERVICE_TOKEN` | Admin Review, Workspace Convex | Direct Admin-to-Convex reads/actions | Dedicated service token for Convex admin functions; do not reuse Workspace admin token |
| `QENTRAH_CLIENT_ID` | Demo Partner App, partner products | Partners client id for app authorization | Public client ID issued after partner app approval |
| `QENTRAH_CLIENT_SECRET` | Confidential partner products | Legacy confidential clients | Secret used only by legacy server-side token exchange |
| `PARTNER_APP_URL` | Demo Partner App, partner products | Partner authorization callback construction | Partner app public origin |
| `SESSION_SECRET` | Demo Partner App | Demo session cookie encryption | Local encryption/signing secret |

## Workspace Variables

Production baseline:

```bash
NEXT_PUBLIC_SITE_URL=https://app.qentrah.com
SITE_URL=https://app.qentrah.com
WORKOS_AUTH_ENABLED=true
```

Common Workspace variables:

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Browser | Public Workspace base URL |
| `SITE_URL` | Server | Canonical Workspace URL |
| `TRUSTED_ORIGINS` | Server | Additional trusted origins |
| `WORKOS_AUTH_ENABLED` | Server | Enables WorkOS AuthKit routes and middleware |
| `WORKOS_API_KEY` | Secret | WorkOS server API key for AuthKit, Organizations, API Keys, and webhook verification |
| `WORKOS_CLIENT_ID` | Server | WorkOS AuthKit client id expected in session JWTs |
| `WORKOS_WEBHOOK_SECRET` | Secret | WorkOS webhook signing secret for `/api/webhooks/workos` |
| `WORKOS_COOKIE_PASSWORD` | Secret | Reserved WorkOS cookie encryption/password value; keep at least 32 characters when enabled |
| `WORKOS_CALLBACK_URL` | Server | AuthKit callback URL; defaults to `${SITE_URL}/api/auth/workos/callback` |
| `WORKOS_LOGOUT_RETURN_URL` | Server | Post-logout return URL; defaults to `${SITE_URL}/en/sign-in` |
| `WORKOS_POST_LOGIN_URL` | Server | Post-login Workspace URL; defaults to `${SITE_URL}/en` |
| `WORKOS_JWT_ISSUER` | Server | WorkOS session token issuer override; defaults to `https://api.workos.com` |
| `WORKOS_COOKIE_DOMAIN` | Server | Optional cookie domain for Workspace WorkOS session cookies |
| `WORKOS_COOKIE_SECURE` | Server | Set `false` only for local HTTP testing |
| `WORKOS_API_BASE_URL` | Server | WorkOS API origin override for tests/sandbox; defaults to `https://api.workos.com` |
| `WORKOS_MOBILE_CALLBACK_URL` | Server | Mobile OAuth callback URL; defaults to `qentrah://auth-callback` | Must match the mobile app callback URI registered in WorkOS. |
| `GOOGLE_CLIENT_ID` | Server | Google sign-in client ID |
| `GOOGLE_CLIENT_SECRET` | Secret | Google sign-in secret |
| `APPLE_CLIENT_ID` | Server | Optional Apple sign-in client ID or bundle identifier |
| `APPLE_APP_BUNDLE_IDENTIFIER` | Server | Optional native Apple bundle identifier for mobile sign-in |
| `PLATFORM_ADMIN_EMAILS` | Server | Platform admin allowlist |
| `NEXT_PUBLIC_CONVEX_URL` | Browser | Convex client URL |
| `CONVEX_URL` | Server | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Browser | Convex site URL for auth bridge |
| `CONVEX_SITE_URL` | Server | Convex site URL |
| `PARTNER_APPS_ENABLED` | Server | Enables or disables partner app features |
| `PARTNER_OAUTH_ISSUER` | Server | OAuth issuer override |
| `PARTNER_OAUTH_AUDIENCE` | Server | Partner API audience override |
| `WORKSPACE_CONVEX_BRIDGE_SECRET` | Secret | Server-only token for Hono-to-Convex partner/API resource calls |
| `ADMIN_CONVEX_SERVICE_TOKEN` | Secret | Dedicated token accepted by Workspace Convex admin functions |
| `PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY` | Secret | Encrypts partner webhook secrets |
| `ORGANIZATION_DATA_ENCRYPTION_KEY` | Secret | Master key for organization-scoped user/business data encryption |
| `OPENROUTER_API_KEY` | Secret | AI model calls |
| `OPENROUTER_MODEL` | Server | AI model ID |
| `OPENROUTER_APP_NAME` | Server | AI attribution name |
| `UPLOADTHING_TOKEN` | Secret | UploadThing encoded token |
| `UPLOADTHING_SECRET` | Secret | UploadThing API secret |
| `UPLOADTHING_APP_ID` | Server | UploadThing app ID |
| `TAMARA_API_BASE_URL` | Server | Tamara API origin; production value is `https://api.tamara.co` |
| `TAMARA_API_TOKEN` | Secret | Tamara merchant API token used for checkout, authorise, capture, and order lookup |
| `TAMARA_NOTIFICATION_TOKEN` | Secret | Tamara notification token used to verify webhook JWT signatures |
| `TAMARA_PUBLIC_KEY` | Server | Tamara merchant public key; set manually with the merchant integration credentials |
| `TAMARA_WEBHOOK_URL` | Server | Public Tamara webhook endpoint, usually `https://app.qentrah.com/api/v1/billing/tamara/webhook` |
| `TAMARA_CAPTURE_MODE` | Server | Tamara capture behavior; use `immediate` for the digital monthly workspace plan |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Browser | Map UI token |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser | Client Sentry DSN |
| `SENTRY_DSN` | Server | Server Sentry DSN |
| `SENTRY_ORG` | Build | Sentry source map org |
| `SENTRY_PROJECT` | Build | Sentry source map project |
| `SENTRY_AUTH_TOKEN` | Secret | Sentry source map upload token |
| `NEXT_PUBLIC_QENTRAH_PERF_DEBUG` | Browser | Optional performance debug flag |

UploadThing v7 requires `UPLOADTHING_TOKEN` to be a base64 encoded JSON object with `apiKey`, `appId`, and a non-empty `regions` array. In Vercel, paste the token value without `.env` quote characters. `UPLOADTHING_SECRET` must match the decoded `apiKey`, and `UPLOADTHING_APP_ID` must match the decoded `appId`.

## Partners Variables

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
| `CONVEX_DEPLOYMENT` | Local/dev | Convex deployment selector |
| `CONVEX_URL` | Server | Partners Convex URL |
| `CONVEX_SITE_URL` | Server | Partners Convex site URL |
| `NEXT_PUBLIC_CONVEX_URL` | Browser | Partners Convex client URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Browser | Partners Convex site URL |
| `BETTER_AUTH_SECRET` | Secret | Partners auth signing secret |
| `PARTNER_SIGNUP_BRIDGE_SECRET` | Secret | Secures sign-up bridge route |
| `PARTNERS_PLATFORM_SERVICE_TOKEN` | Secret | Allows Workspace to read/verify published apps |
| `PARTNERS_ADMIN_SERVICE_TOKEN` | Secret | Allows Admin Review to review partner apps |
| `QENTRAH_WORKSPACE_API_URL` | Server/browser as needed | Workspace origin for integrations |

## Admin Review Variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `PARTNERS_API_BASE_URL` | Server | Partners origin for review service API calls |
| `PARTNERS_ADMIN_SERVICE_TOKEN` | Secret | Service token accepted by Partners |
| `WORKSPACE_API_BASE_URL` | Server | Optional Workspace origin for operational data |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Secret | Service token accepted by Workspace |
| `ADMIN_CONVEX_SERVICE_TOKEN` | Secret | Dedicated token used for Admin Review direct Convex access |

## Mobile Variables

Production baseline:

```bash
QENTRAH_MOBILE_ENV=production
EXPO_PUBLIC_PRODUCTION_WORKSPACE_API_URL=https://app.qentrah.com
EXPO_PUBLIC_PRODUCTION_AUTH_URL=https://app.qentrah.com
EXPO_PUBLIC_PRODUCTION_CONVEX_URL=<production Convex URL>
```

Development baseline for simulator usage:

```bash
QENTRAH_MOBILE_ENV=development
EXPO_PUBLIC_DEV_WORKSPACE_API_URL=http://localhost:3000
EXPO_PUBLIC_DEV_AUTH_URL=http://localhost:3000
```

Development baseline for a physical device:

```bash
QENTRAH_MOBILE_ENV=development
EXPO_PUBLIC_DEV_WORKSPACE_API_URL=http://<your-lan-ip>:3000
EXPO_PUBLIC_DEV_AUTH_URL=http://<your-lan-ip>:3000
```

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `QENTRAH_MOBILE_ENV` | Build-time | Selects `development` local API behavior or `production` release behavior |
| `EXPO_PUBLIC_WORKSPACE_API_URL` | Mobile client | Workspace API origin for `/api/v1` calls from Expo |
| `EXPO_PUBLIC_AUTH_URL` | Mobile client | Workspace auth origin for sign-in/session APIs |
| `EXPO_PUBLIC_CONVEX_URL` | Mobile client | Convex client URL |
| `EXPO_PUBLIC_CONVEX_SITE_URL` | Mobile client | Optional Convex site URL fallback for auth bridges |
| `EXPO_PUBLIC_DEV_WORKSPACE_API_URL` | Mobile client | Development-only Workspace API origin; use a LAN IP for physical devices |
| `EXPO_PUBLIC_DEV_AUTH_URL` | Mobile client | Development-only auth origin; usually matches the local Workspace origin |
| `EXPO_PUBLIC_DEV_CONVEX_URL` | Mobile client | Development-only Convex client URL override |
| `EXPO_PUBLIC_PRODUCTION_WORKSPACE_API_URL` | Mobile client | Production release Workspace API origin; defaults to `https://app.qentrah.com` |
| `EXPO_PUBLIC_PRODUCTION_AUTH_URL` | Mobile client | Production release auth origin; defaults to the production Workspace origin |
| `EXPO_PUBLIC_PRODUCTION_CONVEX_URL` | Mobile client | Production release Convex client URL |
| `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mobile client | Mapbox public token for mobile map surfaces |

Mobile values are public once bundled into the app. Do not add service tokens,
client secrets, refresh tokens, or OAuth access tokens with an `EXPO_PUBLIC_`
prefix.

The mobile app resolves URLs by build intent, not by whether the build happens
on a developer laptop. `QENTRAH_MOBILE_ENV=development` uses development/local
API overrides. `QENTRAH_MOBILE_ENV=production` is for App Store/TestFlight style
release builds and rejects local Workspace/auth URLs.

## Demo Partner App Variables

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

## Marketing Variables

Production baseline:

```bash
NEXT_PUBLIC_WORKSPACE_URL=https://app.qentrah.com
NEXT_PUBLIC_PARTNERS_URL=https://partners.qentrah.com
```

Marketing currently has no required private integration token documented at the
repo level. Add variables here when the app gains runtime integrations.
