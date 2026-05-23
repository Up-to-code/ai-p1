# Environment Variables

This is the canonical repo-level environment reference. For the full setup
walkthrough, see [Setup and configuration](../SETUP_AND_CONFIGURATION.md).

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
| Better Auth | Auth configuration guidance | [Better Auth installation](https://better-auth.com/docs/installation) |
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
| `QENTRAH_WORKSPACE_API_URL` | Partners, Demo Partner App | Calling Workspace APIs or OAuth | Canonical Workspace origin |
| `PARTNERS_API_BASE_URL` | Admin Review, Workspace | Reviewing and reading published partner apps | Partners origin for admin/platform service APIs |
| `PARTNERS_ADMIN_SERVICE_TOKEN` | Admin Review, Partners | Reviewing partner apps | Service token for Partners admin APIs |
| `PARTNERS_PLATFORM_SERVICE_TOKEN` | Partners, Workspace | Published catalog reads and authorization verification | Service token for Partners platform APIs |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Admin Review, Workspace | Workspace operational data and OAuth projection | Service token accepted by Workspace admin APIs |
| `ADMIN_CONVEX_SERVICE_TOKEN` | Admin Review, Workspace Convex | Direct Admin-to-Convex reads/actions | Dedicated service token for Convex admin functions; do not reuse Workspace admin token |
| `QENTRAH_CLIENT_ID` | Demo Partner App, partner products | OAuth integration | Public OAuth client ID issued after partner app approval |
| `QENTRAH_CLIENT_SECRET` | Confidential partner products | Confidential OAuth clients | Secret used only by server-side token exchange |
| `PARTNER_APP_URL` | Demo Partner App, partner products | OAuth callback construction | Partner app public origin |
| `SESSION_SECRET` | Demo Partner App | Demo session cookie encryption | Local encryption/signing secret |

## Workspace Variables

Production baseline:

```bash
NEXT_PUBLIC_SITE_URL=https://app.qentrah.com
SITE_URL=https://app.qentrah.com
BETTER_AUTH_URL=https://app.qentrah.com
```

Common Workspace variables:

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Browser | Public Workspace base URL |
| `SITE_URL` | Server | Canonical Workspace URL |
| `BETTER_AUTH_URL` | Server | Explicit Better Auth base URL when needed |
| `BETTER_AUTH_SECRET` | Secret | Better Auth signing secret |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Server | Extra trusted origins |
| `TRUSTED_ORIGINS` | Server | Additional trusted origins |
| `GOOGLE_CLIENT_ID` | Server | Google sign-in client ID |
| `GOOGLE_CLIENT_SECRET` | Secret | Google sign-in secret |
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

## Demo Partner App Variables

Production baseline:

```bash
QENTRAH_WORKSPACE_API_URL=https://app.qentrah.com
PARTNER_APP_URL=https://demo.qentrah.com
```

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `QENTRAH_WORKSPACE_API_URL` | Server | Workspace OAuth and resource API origin |
| `QENTRAH_CLIENT_ID` | Public/server | OAuth client ID |
| `QENTRAH_CLIENT_SECRET` | Secret | Optional confidential client secret |
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
