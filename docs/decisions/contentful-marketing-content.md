# Contentful for Marketing Content

Status: Accepted, updated 2026-07-15

## Decision

Contentful is the editorial source for localized public Marketing copy.
Workspace product data, authentication, billing, and private organization data
remain outside the CMS.

Marketing reads one published `qentrahFooterBlock` site-composition entry per
supported locale. The API ID is retained because Contentful's space-level
content-type quota prevented adding another wrapper model; its editor name is
`Qentrah · Marketing site`. Editors work with normal Contentful inputs and
references rather than a JSON payload. The Home reference composes `qentrahLandingHero`,
`qentrahPlatformStoryBlock`, `qentrahAiOutcomesBlock`,
`qentrahTrustBlock`, and `qentrahCtaBlock` entries. Repeatable title/body
content uses `qentrahLandingTextCard`. Landing-page artwork is not a CMS
surface: the Hero, context story, AI showcase, scoped-agent cards, and trust
cards use code-owned semantic interface compositions instead of uploaded
screenshots or illustrations. The
site root also owns brand/footer inputs and references Navigation, Pricing,
Legal, SEO, FAQ, logo-cloud, feature-row, plan-copy, and comparison blocks.
Branding is a referenced `qentrahBrandBlock`, and the active Hero headline,
benefits, labels, and note are owned by
`qentrahLandingHero`. Home support labels, logo cloud, and FAQ are grouped by
`qentrahHomeSupportBlock`. The deprecated `qentrahMarketingLocale`
Object-payload model is not part of this architecture and must remain absent.
The model is an exact authoring projection of active Marketing renderers:
fields with no rendered or metadata consumer are removed instead of retained
as legacy editor inputs. The model audit compares exact field IDs as well as
content-type IDs and rejects drift.

Contentful owns editable public Marketing copy and editorial structure.
Brand marks, logo-cloud icons, and SEO social images may remain referenced
Assets; product presentation artwork does not. Commercial prices,
entitlements, routes, authorization, product state, testimonials, and runtime
behavior remain code-owned. Pricing presentation may be edited, while factual
plan values are always calculated from `@qentrah/domain-contracts`.

## Delivery boundary

- `apps/marketing/lib/contentful.ts` owns server-only Content Delivery and
  Preview API access, cache configuration, and provider-failure handling.
- `apps/marketing/lib/contentful-landing-page.ts` resolves Contentful page,
  block and card references into the narrow landing payload.
- `apps/marketing/lib/contentful-marketing-site.ts` resolves the site root and
  its Navigation, Home, Pricing, Legal, SEO, brand, Footer, and nested editor
  blocks.
- `apps/marketing/lib/contentful-payload.ts` accepts only keys already present
  in the typed repository content and only values with compatible shapes.
- `apps/marketing/lib/landing-page-content.ts` owns the localized structure for
  the home-page platform story, AI outcomes, trust, and CTA blocks.
- The localized layout resolves one content snapshot and provides it to
  `next-intl` and the narrow Marketing presentation context.
- `POST /api/contentful/revalidate` accepts a server-only shared secret and
  invalidates the Contentful cache after publish or unpublish events.
- `apps/marketing/scripts/sync-contentful-models.mjs` and
  `seed-contentful-drafts.mjs` use the official Contentful MCP server to keep
  the input-only model and localized mock drafts reproducible.

## Fallback policy

Repository-owned localized content remains mandatory. Missing credentials,
network failures, non-success responses, missing entries, unknown fields, and
type-incompatible values fall back to that content. Contentful availability
must never make the public site blank or block a deployment.

## Security

Delivery, Preview, and webhook credentials are server-only. They must not use
`NEXT_PUBLIC_` names or be copied into Workspace or Convex environments. Preview
credentials are restricted to preview deployments.

## Consequences

Editors can use labeled text, list, reference, and the explicitly supported
brand/metadata Asset inputs without editing JSON. Product screenshots and
decorative landing illustrations cannot be introduced through Contentful.
No Contentful Object field is part of the Marketing model. Application contracts and a production-safe fallback remain under source
control. Adding a new CMS-controlled surface requires first adding its typed
repository shape, then extending the reference resolver, overlay contract, and
focused tests.
