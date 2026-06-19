# How to Use the Marketing CMS

## Quick Start

### 1. Start the Marketing Server

```bash
npm run dev:marketing
```

The server will start on `http://localhost:3005`.

### 2. Access Payload Admin

Open your browser to:

```
http://localhost:3005/admin
```

If you haven't created a user yet, you'll need to create one through Payload's initial setup.

---

## Creating a Marketing Page

### Step 1: Create a New Page

1. In Payload admin, go to **Marketing Pages**
2. Click **"Add New"**

### Step 2: Fill in Basic Info

- **Title**: Page title (e.g. "Pricing")
- **URL Slug**: `pricing` (without `/` or locale prefix)
- **Page Type**: Choose from home, pricing, about, contact, docs, generic
- **Excerpt**: Short summary for previews/SEO

### Step 3: Add Content Sections

Click **"Add Section"** and choose a block type:

#### Hero Section
- Eyebrow text (small text above title)
- Title (required)
- Subtitle
- Hero image
- Primary CTA (label + link)
- Secondary CTA (label + link)

**Example:**
```
Title: "Pricing that grows with you"
Subtitle: "Start free, scale with Pro, or go Enterprise"
Primary CTA: "Start free" → https://app.qentrah.com/sign-up
Secondary CTA: "Contact sales" → /contact
Hero Image: Upload or select from media
```

#### Feature Grid
- Section title
- Section subtitle
- Features array:
  - Icon/image
  - Feature title
  - Description
  - Optional link

**Example:**
```
Title: "What's included"
Features:
  - Title: "Unlimited projects", Description: "Create unlimited projects and tasks"
  - Title: "AI agents", Description: "Intelligent automation for your workflows"
  - Title: "Team collaboration", Description: "Work together in real-time"
```

#### Image + Text
- Layout: Image left or image right
- Image (required)
- Title
- Rich text content
- CTA button (optional)

#### CTA Section
- Title
- Description
- Primary CTA (label + href, required)
- Secondary CTA (label + href, optional)

**Tip:** This renders with colored background, great for conversions.

#### Stats Section
- Section title
- Stats array (up to 4):
  - Value (e.g. "10,000+", "99%")
  - Label
  - Description

#### Testimonial Section
- Section title
- Testimonials array:
  - Quote
  - Author name
  - Author role
  - Author avatar
  - Company logo

#### Rich Text
- Full rich text editor
- Use for long-form content, articles, documentation

### Step 4: Configure SEO

Scroll down to the **SEO** section:

- **SEO Title**: Override page title for search engines
- **SEO Description**: 150-160 characters recommended
- **Keywords**: Comma-separated
- **Open Graph Image**: Social sharing image (1200x630px recommended)
- **No Index**: Check to prevent search engine indexing
- **Canonical URL**: Optional custom canonical URL

**Tip:** If you leave SEO title empty, it will use the page title.

### Step 5: Switch Languages

Use the locale switcher at the top to add content for each language:

- **English (en)**
- **العربية (ar)**

All text fields are localized. Images/files are shared across locales.

### Step 6: Publish

1. Set **Status** to **Published** (in sidebar)
2. Set **Published At** date (optional, defaults to now)
3. Click **Save**

---

## Viewing Your Page

### CMS-Driven Pages

The following routes automatically check for CMS content:

- `/[locale]/pricing` → fetches `marketing-pages` where slug="pricing"
- `/[locale]/about` → fetches `marketing-pages` where slug="about"  
- `/[locale]/contact` → fetches `marketing-pages` where slug="contact"
- `/[locale]/docs` → fetches `marketing-pages` where slug="docs"

**Example URLs:**
```
http://localhost:3005/en/pricing
http://localhost:3005/ar/pricing
http://localhost:3005/en/about
http://localhost:3005/ar/about
```

### Fallback Behavior

If CMS content doesn't exist:
- Pricing → Shows hardcoded `WorkspacePricingPage`
- About → Shows hardcoded `WorkspaceAboutPage`
- Contact → Shows hardcoded `WorkspaceContactPage`
- Docs → Shows "Coming soon" message

This means you can gradually migrate pages to CMS.

---

## Managing Media

### Upload Images/Files

1. Go to **Media** in Payload admin
2. Click **"Add New"**
3. Upload file (images, PDFs, Word, Excel supported)
4. Fill in:
   - **Alt text** (required for accessibility)
   - **Caption** (localized, optional)
   - **Credit** (photographer/source attribution)
   - **Is Downloadable** (allow public download)

### Use in Pages

When adding blocks with images:
1. Click the image field
2. Choose **"Select existing"** or **"Upload new"**
3. Select from media library

---

## Blog Posts

### Create a Blog Post

1. Go to **Blog Posts**
2. Click **"Add New"**
3. Fill in:
   - **Title** (localized)
   - **Slug** (e.g. `how-qentrah-helps-agencies`)
   - **Excerpt** (localized, short summary)
   - **Body** (localized, rich text)
   - **Hero Image** (main image for detail page)
   - **Card Image** (smaller image for listings)
   - **Author** name (localized)
   - **Author Avatar**
   - **Author Role** (e.g. "Founder", "Product Manager")
   - **Category** (localized)
   - **Tags** (JSON array)
   - **Reading Time** (minutes, default 5)
   - **Published At** date
   - **Status** (draft/published)
   - **SEO fields**

### View Blog

- Blog listing: `/[locale]/blog`
- Blog detail: `/[locale]/blog/[slug]`

---

## Tips & Best Practices

### Content

- **Titles**: Keep under 60 characters for SEO
- **Descriptions**: 150-160 characters for SEO
- **Images**: Use descriptive alt text for accessibility
- **Links**: Use real URLs, avoid `#` placeholders

### CTAs

**Workspace links:**
- Sign up: `https://app.qentrah.com/sign-up`
- Sign in: `https://app.qentrah.com/sign-in`
- Dashboard: `https://app.qentrah.com`

**Internal links:**
- Other pages: `/pricing`, `/about`, `/contact`
- Blog: `/blog/post-slug`

**External links:**
- Full URL: `https://example.com`

### SEO

- Fill in SEO fields for every public page
- Use unique titles and descriptions
- Upload Open Graph images (1200x630px)
- Set canonical URLs when needed
- Use `noIndex` for test/staging content only

### Localization

- Switch languages before entering content
- All text fields are localized (title, description, etc.)
- Images/files are shared (not localized)
- URLs stay the same: `/en/pricing` and `/ar/pricing` both use slug="pricing"

### Performance

- Optimize images before upload (use WebP when possible)
- Keep image file sizes under 500KB
- Use lazy loading (automatic in Next.js Image component)
- Don't add too many sections to one page (5-8 is ideal)

---

## Troubleshooting

### Page doesn't show CMS content

1. Check page status is **Published**
2. Check slug matches route (e.g. slug="pricing" for `/pricing`)
3. Check locale matches (content exists for that language)
4. Refresh page or restart dev server

### Images don't load

1. Check image uploaded successfully in Media
2. Check alt text is filled in (required)
3. Check file size not too large (< 10MB)
4. Check file format is supported

### SEO metadata doesn't update

1. Check you saved the page
2. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Check metadata in page source (View → Developer → View Source)

---

## Advanced: Adding New Languages

1. Update `apps/marketing/lib/locales.ts`:

```ts
export type LocaleCode = "en" | "ar" | "fr"; // Add "fr"

export const locales = [
  // ...existing
  {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    direction: "ltr",
  },
] as const;
```

2. Restart dev server

3. Payload admin will now show French tab for localized fields

4. Add French routes in Next.js if needed

---

## Support

- Check `apps/marketing/CMS_PROGRESS.md` for implementation details
- Check `apps/marketing/IMPLEMENTATION_STATUS.md` for technical status
- Check lifecycle docs in `docs/lifecycles/marketing-payloadcms/`

---

## Example: Complete Pricing Page

```yaml
Title: Pricing
Slug: pricing
Page Type: pricing
Status: published

Sections:

1. Hero Block
   Title: "Pricing that grows with you"
   Subtitle: "Start free, scale with Pro, or go Enterprise"
   Primary CTA: "Start free" → https://app.qentrah.com/sign-up
   Secondary CTA: "View plans" → #plans
   Hero Image: pricing-hero.jpg

2. Feature Grid Block
   Title: "What's included"
   Subtitle: "All plans include"
   Features:
     - Title: "Unlimited projects"
     - Title: "AI agents"
     - Title: "Team collaboration"

3. Stats Block
   Title: "Trusted by agencies worldwide"
   Stats:
     - Value: "10,000+", Label: "Active users"
     - Value: "99.9%", Label: "Uptime"
     - Value: "24/7", Label: "Support"

4. CTA Section Block
   Title: "Ready to get started?"
   Description: "Start your free trial today. No credit card required."
   Primary CTA: "Sign up free" → https://app.qentrah.com/sign-up
   Secondary CTA: "Contact sales" → /contact

SEO:
  Title: "Pricing | Qentrah"
  Description: "Transparent and flexible pricing for Qentrah. Start free, scale with Pro, or go Enterprise."
  Keywords: "pricing, workspace, AI, collaboration, agencies"
  Image: og-pricing.jpg
```

This creates a complete, professional pricing page with zero code!
