# Files

| File | Why it matters |
| --- | --- |
| `apps/marketing/package.json` | Declares Payload, database adapter, rich text, translations, and GraphQL runtime dependencies used by the marketing app build/runtime. |
| `package-lock.json` | Locks dependency versions for reproducible workspace installs and Vercel builds. |
| `apps/marketing/payload.config.ts` | Central Payload config: collections, admin user collection, SQLite adapter, localization, i18n, and secret handling. |
| `apps/marketing/next.config.ts` | Wraps Next config with Payload and next-intl integration. |
| `apps/marketing/app/layout.tsx` | Shared root layout with Payload root layout/server functions and generated import map; intentionally avoids marketing CSS so admin stays isolated. |
| `apps/marketing/app/(site)/layout.tsx` | Public marketing route group layout; imports `globals.css` only for public site routes. |
| `apps/marketing/app/(payload)/layout.tsx` | Payload route segment layout; imports Payload admin CSS for all generated admin/API UI routes. |
| `apps/marketing/app/(payload)/admin/[[...segments]]/page.tsx` | Generated Payload admin route. |
| `apps/marketing/app/(payload)/admin/[[...segments]]/not-found.tsx` | Generated Payload admin not-found route. |
| `apps/marketing/app/(payload)/admin/importMap.ts` | Generated Payload admin import map. |
| `apps/marketing/app/(payload)/api/[...slug]/route.ts` | Generated Payload REST route handlers. |
| `apps/marketing/app/(payload)/graphql/route.ts` | Generated Payload GraphQL route handlers; imports `@payloadcms/graphql`, which requires the `graphql` package. |
| `apps/marketing/lib/locales.ts` | Centralized locale configuration for supported languages, direction, and Payload integration. |
| `apps/marketing/lib/workspace-links.ts` | Workspace app link helpers for marketing CTAs pointing to `https://app.qentrah.com`. |
| `apps/marketing/lib/public-links.ts` | Public marketing navigation links with localized labels and descriptions. |
| `apps/marketing/lib/payload.ts` | Creates local Payload client from `@payload-config`. |
| `apps/marketing/lib/payload-api.ts` | Public typed accessors for CMS-backed blog, landing, legal, team, FAQ, and pricing data. |
| `apps/marketing/fields/seoFields.ts` | Reusable SEO field group for pages, blog posts, and other public content. |
| `apps/marketing/fields/linkField.ts` | Reusable link field for CTAs and navigation. |
| `apps/marketing/blocks/HeroBlock.ts` | Hero section block with title, subtitle, image, and CTAs. |
| `apps/marketing/blocks/RichTextBlock.ts` | Rich text content block. |
| `apps/marketing/blocks/FeatureGridBlock.ts` | Feature grid block with icon/image, title, description, and optional link. |
| `apps/marketing/blocks/ImageTextBlock.ts` | Image + text section block with configurable layout. |
| `apps/marketing/blocks/CTASectionBlock.ts` | Call-to-action section block. |
| `apps/marketing/blocks/StatsBlock.ts` | Statistics/metrics section block. |
| `apps/marketing/blocks/TestimonialBlock.ts` | Testimonial block with quote, author, avatar, and company logo. |
| `apps/marketing/collections/MarketingPages.ts` | CMS collection for flexible page builder pages (home, pricing, about, contact, docs, etc.). |
| `apps/marketing/collections/BlogPosts.ts` | Blog posts collection with hero/card images, author details, SEO fields, and rich content. |
| `apps/marketing/collections/Media.ts` | Media upload collection supporting images, PDFs, documents, with accessibility and caption fields. |
| `apps/marketing/app/[locale]/blog/page.tsx` | Public localized blog listing consuming Payload data. |
| `apps/marketing/app/[locale]/blog/[slug]/page.tsx` | Public localized blog detail consuming Payload data. |
| `apps/marketing/app/sitemap.ts` | Adds published Payload blog posts to sitemap when Payload is available. |
