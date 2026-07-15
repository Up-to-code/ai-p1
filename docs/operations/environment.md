# Production environment

Qentrah has three environment owners. Variables belong only at the runtime
that consumes them; do not mirror every secret into every provider.

## Workspace on Vercel

Vercel owns the Next.js and Eve runtime configuration:

- Public origins and Convex URLs: `NEXT_PUBLIC_SITE_URL`, `SITE_URL`,
  `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `QENTRAH_WORKSPACE_URL`,
  `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_URL`,
  `NEXT_PUBLIC_CONVEX_SITE_URL`, and `CONVEX_SITE_URL`.
- Runtime credentials: `BETTER_AUTH_SECRET`, Convex bridge/admin tokens,
  Organization and partner-webhook encryption keys, and OpenRouter settings.
- Dodo checkout: the API key, environment, four subscription products, and the
  one-dollar AI-credit product. The webhook signing secret does not belong on
  Vercel because Convex is the sole provider ingress.
- Optional integrations: PostHog, Sentry, Mapbox, and UploadThing.

`npm run check:production-env` validates the ignored local endpoint template.
During a Vercel production build the same check reads the real platform
environment and fails before compilation when a required runtime value is
missing.

## Convex production

Convex owns Better Auth, email delivery, durable encryption, and signed Dodo
webhook verification. Its production deployment requires:

- `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and the Convex service/bridge
  tokens.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_UPDATES_FROM_EMAIL`, and
  `RESEND_TEST_MODE=false`.
- `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_ENVIRONMENT`, all five Dodo product
  IDs, and `DODO_PAYMENTS_WEBHOOK_SECRET`.
- `ORGANIZATION_DATA_ENCRYPTION_KEY` and
  `PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY`.

Each deployment has its own Dodo endpoint and signing secret. Production uses
`https://focused-shepherd-801.convex.site/dodopayments-webhook`; never use the
`.convex.cloud` functions origin for HTTP actions.

## Marketing on Vercel

Marketing has no Convex runtime dependency. It uses:

- `NEXT_PUBLIC_WORKSPACE_URL`
- `NEXT_PUBLIC_PARTNERS_URL`
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST`
- Contentful delivery: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, and
  `CONTENTFUL_REVALIDATE_SECRET`.
- Optional Contentful controls: `CONTENTFUL_ENVIRONMENT` (defaults to
  `master`), `CONTENTFUL_MARKETING_CONTENT_TYPE` (defaults to
  `qentrahFooterBlock`, whose editor name is `Qentrah · Marketing site`), and `CONTENTFUL_REVALIDATE_SECONDS` (defaults to
  `3600`).
- Preview deployments only: `CONTENTFUL_USE_PREVIEW=true` and
  `CONTENTFUL_PREVIEW_ACCESS_TOKEN`.

Contentful secrets are server-only and must never use a `NEXT_PUBLIC_` prefix.
The repository content remains the runtime fallback when Contentful is missing
or unavailable. Old `STRAPI_*` values are local leftovers and must not be added
to Vercel.

## Provider mode

The current Dodo account is still in Test Mode, so production is intentionally
configured as `test_mode`. Change the API key, every product ID, the webhook
endpoint, and `DODO_PAYMENTS_ENVIRONMENT` together only after Dodo enables Live
Mode. Mixing test and live identifiers causes checkout failures.
