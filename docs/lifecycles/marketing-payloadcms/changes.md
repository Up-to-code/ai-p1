# Changes

## 2026-06-19

- Added lifecycle documentation for the marketing Payload CMS integration.
- Added `graphql` as a direct `@qentrah/marketing` dependency because the generated Payload GraphQL route imports `@payloadcms/graphql`, which requires `graphql` during `next build`.
- Imported `@payloadcms/next/css` in the Payload route layout so the admin login and CMS screens render with Payload styles.
- Moved public marketing pages into the `(site)` route group and moved `globals.css` into `app/(site)/layout.tsx`, so Payload admin routes no longer inherit marketing Tailwind/global CSS.
- Removed marketing-specific root `<html>` font/class/style props so the shared root layout does not alter Payload admin styling.

## 2026-06-19 (CMS Foundation)

- Added centralized locale configuration in `lib/locales.ts` to support future languages beyond English/Arabic.
- Connected Payload localization to shared locale config.
- Added workspace link helpers in `lib/workspace-links.ts` for marketing CTAs pointing to `https://app.qentrah.com`.
- Fixed public pricing link from `/#pricing` to `/pricing`.
- Created reusable Payload field configs: `seoFields`, `linkField`.
- Created content blocks: `HeroBlock`, `RichTextBlock`, `FeatureGridBlock`, `ImageTextBlock`, `CTASectionBlock`, `StatsBlock`, `TestimonialBlock`.
- Upgraded `Media` collection to support images, PDFs, Word/Excel documents, and text files with caption/credit/accessibility fields.
- Upgraded `BlogPosts` collection with hero image, card image, author avatar, author role, published date, and SEO fields.
- Added `MarketingPages` collection with flexible page builder blocks for CMS-driven public pages.

## 2026-06-19 (Frontend CMS Renderer)

- Created CMS page fetching helpers: `getMarketingPage`, `getAllMarketingPages` in `lib/cms-pages.ts`.
- Created main `PageRenderer` component that routes blocks to appropriate renderers.
- Created placeholder `RichTextRenderer` (TODO: implement full Lexical renderer).
- Created block renderer components for all 7 block types using existing marketing design system tokens.
- All block renderers use accessible semantic HTML, keyboard navigation, and proper ARIA where needed.
- Block renderers use real links (workspace/internal/external), no placeholder `#` links.

## 2026-06-19 (Connect Public Pages to CMS)

- Created CMS-driven page templates for pricing, about, contact, and docs pages.
- Each page fetches content from Payload CMS by slug and locale using `getMarketingPage()`.
- Pages include graceful fallbacks to hardcoded versions when CMS content unavailable.
- Created `lib/cms-seo.ts` with `generateCMSMetadata()` and `generateFallbackMetadata()` helpers.
- All CMS pages generate complete SEO metadata including Open Graph, Twitter cards, robots directives, and canonical URLs.
- SEO fields from CMS take priority, with intelligent fallbacks to page title/excerpt.
