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

| Variable | Used by | Required when | Purpose |
| --- | --- | --- | --- |
| `ANAN_WORKSPACE_API_URL` | Partners, Demo Partner App | Calling Workspace APIs or OAuth | Canonical Workspace origin |
| `WORKSPACE_API_BASE_URL` | Admin Review | Reviewing partner apps | Workspace origin for admin service APIs |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Admin Review, Workspace | Reviewing partner apps | Shared service token for Workspace admin APIs |
| `ANAN_PLATFORM_SERVICE_TOKEN` | Partners, Workspace | Submitting apps from Partners to Workspace | Shared service token for platform registration APIs |
| `PARTNERS_REVIEW_CALLBACK_TOKEN` | Workspace, Partners | Review callback delivery | Authenticates Workspace callback requests to Partners |
| `ANAN_CLIENT_ID` | Demo Partner App, partner products | OAuth integration | Public OAuth client ID issued after partner app approval |
| `ANAN_CLIENT_SECRET` | Confidential partner products | Confidential OAuth clients | Secret used only by server-side token exchange |
| `PARTNER_APP_URL` | Demo Partner App, partner products | OAuth callback construction | Partner app public origin |
| `SESSION_SECRET` | Demo Partner App | Demo session cookie encryption | Local encryption/signing secret |

## Workspace Variables

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
| `PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY` | Secret | Encrypts partner webhook secrets |
| `OPENROUTER_API_KEY` | Secret | AI model calls |
| `OPENROUTER_MODEL` | Server | AI model ID |
| `OPENROUTER_APP_NAME` | Server | AI attribution name |
| `UPLOADTHING_TOKEN` | Secret | UploadThing encoded token |
| `UPLOADTHING_SECRET` | Secret | UploadThing API secret |
| `UPLOADTHING_APP_ID` | Server | UploadThing app ID |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Browser | Map UI token |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser | Client Sentry DSN |
| `SENTRY_DSN` | Server | Server Sentry DSN |
| `SENTRY_ORG` | Build | Sentry source map org |
| `SENTRY_PROJECT` | Build | Sentry source map project |
| `SENTRY_AUTH_TOKEN` | Secret | Sentry source map upload token |
| `NEXT_PUBLIC_ANAN_PERF_DEBUG` | Browser | Optional performance debug flag |

## Partners Variables

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
| `ANAN_PLATFORM_SERVICE_TOKEN` | Secret | Submits apps to Workspace |
| `PARTNERS_REVIEW_CALLBACK_TOKEN` | Secret | Validates Workspace review callback |
| `ANAN_WORKSPACE_API_URL` | Server/browser as needed | Workspace origin for integrations |

## Admin Review Variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `WORKSPACE_API_BASE_URL` | Server | Workspace origin for service API calls |
| `WORKSPACE_ADMIN_SERVICE_TOKEN` | Secret | Service token accepted by Workspace |

## Demo Partner App Variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `ANAN_WORKSPACE_API_URL` | Server | Workspace OAuth and resource API origin |
| `ANAN_CLIENT_ID` | Public/server | OAuth client ID |
| `ANAN_CLIENT_SECRET` | Secret | Optional confidential client secret |
| `PARTNER_APP_URL` | Server | Demo app public origin |
| `DEMO_ACCESS_TOKEN` | Secret | Demo unlock value |
| `SESSION_SECRET` | Secret | Cookie encryption/signing secret |

## Marketing Variables

Marketing currently has no required private integration token documented at the
repo level. Add variables here when the app gains runtime integrations.
