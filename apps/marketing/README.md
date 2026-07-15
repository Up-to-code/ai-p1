# Qentrah Marketing

The Marketing application is the public, localized Qentrah website. Contentful
is the editorial source for published copy, with typed repository content as a
fail-safe fallback.

## Responsibilities

- Public home, pricing, product, legal, and partner pages.
- English, Arabic, and French content and metadata.
- Links into the Workspace application.
- Static sitemap and structured data for repository-owned routes.
- Server-rendered Contentful delivery for the active Home, Pricing, Legal,
  Navigation, Footer, brand, and SEO presentation. Typed repository content
  remains the fail-safe fallback, while prices and entitlements remain
  canonical code-owned facts.

Workspace data, authentication state, and private partner operations do not belong in this application.

## Development

```bash
npm run dev:marketing
npm --workspace @qentrah/marketing run typecheck
npm --workspace @qentrah/marketing run build
```

The development server uses port `3005`.

## Analytics

Marketing initializes PostHog through Next.js client instrumentation when a
project token is configured. Add these variables locally and in Vercel:

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<project-token>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Without a project token, PostHog remains disabled.

## Contentful

The Marketing composition contains normal editor inputs and links to these
presentation blocks:

- `qentrahBrandBlock`: display/accessibility names, accent color, and separate
  light/dark logo Assets.
- `qentrahLandingHero`: eyebrow, active headline, benefits, primary action,
  supporting note, module labels, accessibility text, and hero Asset.
- `qentrahPlatformStoryBlock`: context, platform, scoped-agent copy, actions,
  capability cards, three capability-card image Assets, and context image.
- `qentrahAiOutcomesBlock`: solution heading, body, eyebrow, bullet points,
  showcase image, and explore label.
- `qentrahTrustBlock`: security copy, cards, badges, and three images.
- `qentrahCtaBlock`: final call-to-action copy, actions, and benefit points.
- `qentrahLandingTextCard`: repeatable title/body inputs shared by landing
  blocks.
- `qentrahHomeSupportBlock`: workspace-cell labels, solution tabs, showcase alt
  text, and references to the Home logo cloud and FAQ.
- `qentrahFooterBlock`: the localized Marketing-site composition root. It owns
  footer inputs and references Brand, Navigation, Home, Pricing, Legal, and SEO
  entries. Brand, Hero, Home support, and Footer inputs have one canonical
  owner; unused legacy fields are excluded from the editor schema. The
  historical API ID is retained because of the Contentful space content-type
  quota; its editor name is `Qentrah · Marketing site`.
- `qentrahNavigationBlock` / `qentrahNavigationItem`: global navigation copy.
- `qentrahPricingPage`, plan, feature, comparison, and FAQ blocks: editable
  Pricing presentation; prices and entitlement values still come from the
  canonical subscription catalog in code.
- `qentrahLegalPage` / `qentrahLegalSection`: page and section inputs for legal
  copy.
- `qentrahSeoEntry`: page-keyed title, description, keyword, social-image
  Asset, and social-image alt-text inputs.

Create one page composition for each `locale` value (`en`, `ar`, and `fr`).
Only known fields and compatible values are accepted; missing or invalid block
inputs fall back safely to repository copy.

Configure the delivery runtime with:

```bash
CONTENTFUL_SPACE_ID=<space-id>
CONTENTFUL_ACCESS_TOKEN=<delivery-token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<preview-token>
CONTENTFUL_MANAGEMENT_ACCESS_TOKEN=<management-token-for-local-mcp-only>
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_MARKETING_CONTENT_TYPE=qentrahFooterBlock
CONTENTFUL_REVALIDATE_SECONDS=3600
CONTENTFUL_REVALIDATE_SECRET=<random-webhook-secret>
```

For unpublished-content review only, set `CONTENTFUL_USE_PREVIEW=true` and
`CONTENTFUL_PREVIEW_ACCESS_TOKEN`. The official Contentful MCP server uses the
separate `CONTENTFUL_MANAGEMENT_ACCESS_TOKEN` for local content-management
operations. Never expose any access token with a `NEXT_PUBLIC_` prefix.

Configure a Contentful outgoing webhook for publish/unpublish events to call
`POST https://qentrah.com/api/contentful/revalidate` with either
`Authorization: Bearer <CONTENTFUL_REVALIDATE_SECRET>` or an
`x-contentful-webhook-secret` header. Normal delivery is cached for the
configured interval; the webhook invalidates it immediately.

If Contentful is unconfigured, unavailable, or returns an incompatible
payload, Marketing continues rendering the localized repository copy.

The local authoring helpers use the official Contentful MCP server and never
publish entries or assets:

```bash
npm --workspace @qentrah/marketing run contentful:models
npm --workspace @qentrah/marketing run contentful:seed-drafts
npm --workspace @qentrah/marketing run contentful:audit
npm --workspace @qentrah/marketing run contentful:prune
```

The first command synchronizes labeled Symbol, Text, Array, Entry-reference,
and Asset fields. The second creates or completes localized draft compositions.
The audit command reads the live model through the same official MCP server and
fails on missing, unexpected, or Object/JSON models or fields. Pruning is the
explicit destructive schema step: it removes fields that have no active
renderer, then synchronizes the current model. None of these commands publishes
entries or assets.
