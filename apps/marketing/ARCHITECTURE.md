# Marketing CMS Architecture

## System Overview

```mermaid
graph TD
    A[Editor] -->|Creates Content| B[Payload Admin]
    B -->|Stores in| C[SQLite DB]
    C -->|Fetches Data| D[Next.js Pages]
    D -->|Renders| E[User]
    
    F[Content Blocks] -->|Configured in| B
    G[SEO Fields] -->|Configured in| B
    H[Media Library] -->|Managed in| B
    
    D -->|Generates| I[Sitemap]
    D -->|Outputs| J[JSON-LD]
    D -->|Serves| K[Localized Content]
    
    style B fill:#3b82f6
    style D fill:#10b981
    style C fill:#f59e0b
```

## Content Flow

```mermaid
sequenceDiagram
    participant Editor
    participant Payload
    participant Database
    participant NextJS
    participant User

    Editor->>Payload: Create/Edit Content
    Payload->>Database: Store (EN/AR)
    User->>NextJS: Request /en/pricing
    NextJS->>Database: Query Page Data
    Database->>NextJS: Return CMS Data
    NextJS->>NextJS: Render Blocks
    NextJS->>User: Serve HTML + SEO
```

## Data Model

```mermaid
erDiagram
    MarketingPages ||--o{ Blocks : contains
    MarketingPages ||--o{ SEO : has
    BlogPosts ||--|| Media : heroImage
    BlogPosts ||--|| Media : cardImage
    BlogPosts ||--|| Media : authorAvatar
    BlogPosts ||--o{ SEO : has
    
    MarketingPages {
        string slug
        string title
        enum status
        json blocks
        json seo
    }
    
    BlogPosts {
        string title
        string slug
        text excerpt
        json body
        string author
        string authorRole
        string category
        json tags
        int readingTime
        datetime publishedAt
        enum status
    }
    
    Media {
        string filename
        string url
        string alt
        int width
        int height
        string mimeType
    }
    
    Blocks {
        enum blockType
        json content
    }
    
    SEO {
        string title
        text description
        string keywords
        string ogImage
        string canonical
    }
```

## Component Hierarchy

```mermaid
graph TD
    A[Page Component] --> B[PageRenderer]
    B --> C1[HeroBlock]
    B --> C2[RichTextBlock]
    B --> C3[FeatureGridBlock]
    B --> C4[ImageTextBlock]
    B --> C5[CTABlock]
    B --> C6[StatsBlock]
    B --> C7[TestimonialBlock]
    
    D[Blog Page] --> E[BlogDetail]
    E --> F[Hero Section]
    E --> G[Author Card]
    E --> H[Rich Content]
    E --> I[Author Footer]
    
    J[Blog List] --> K[BlogCard]
    K --> L[Card Image]
    K --> M[Category Badge]
    K --> N[Author Avatar]
    
    style A fill:#3b82f6
    style D fill:#10b981
    style J fill:#10b981
```

## Localization Architecture

```mermaid
graph LR
    A[User Request] --> B{Locale Detection}
    B -->|EN| C[English Content]
    B -->|AR| D[Arabic Content]
    
    C --> E[LTR Layout]
    D --> F[RTL Layout]
    
    E --> G[Rendered Page]
    F --> G
    
    H[CMS] -->|Stores| I[Localized Fields]
    I -->|title_en| C
    I -->|title_ar| D
    I -->|body_en| C
    I -->|body_ar| D
    
    style B fill:#f59e0b
    style H fill:#3b82f6
```

## SEO & Metadata Flow

```mermaid
graph TD
    A[CMS Content] --> B[Page Component]
    B --> C{CMS SEO Fields?}
    C -->|Yes| D[Use CMS Metadata]
    C -->|No| E[Use Fallback Metadata]
    
    D --> F[Generate Metadata]
    E --> F
    
    F --> G[Open Graph Tags]
    F --> H[Twitter Cards]
    F --> I[Canonical URL]
    F --> J[Language Alternates]
    F --> K[JSON-LD Schema]
    
    K --> L[Organization]
    K --> M[Article]
    K --> N[BreadcrumbList]
    K --> O[Product/Offer]
    
    G --> P[HTML Head]
    H --> P
    I --> P
    J --> P
    K --> P
    
    style C fill:#f59e0b
    style P fill:#10b981
```

## Content Blocks System

```mermaid
graph TD
    A[Marketing Page] --> B{Block Type}
    
    B -->|hero| C[Hero Block]
    C --> C1[Heading]
    C --> C2[Subheading]
    C --> C3[CTA Buttons]
    C --> C4[Background Image]
    
    B -->|richText| D[Rich Text Block]
    D --> D1[Lexical Editor]
    D1 --> D2[Headings]
    D1 --> D3[Paragraphs]
    D1 --> D4[Lists]
    D1 --> D5[Links]
    
    B -->|featureGrid| E[Feature Grid Block]
    E --> E1[Grid Layout]
    E1 --> E2[Feature Cards]
    E2 --> E3[Icon]
    E2 --> E4[Title]
    E2 --> E5[Description]
    
    B -->|imageText| F[Image+Text Block]
    F --> F1[Image]
    F --> F2[Content]
    F --> F3[Layout: Left/Right]
    
    B -->|cta| G[CTA Block]
    G --> G1[Heading]
    G --> G2[Description]
    G --> G3[Primary Button]
    G --> G4[Secondary Button]
    
    B -->|stats| H[Stats Block]
    H --> H1[Stats Grid]
    H1 --> H2[Number]
    H1 --> H3[Label]
    
    B -->|testimonial| I[Testimonial Block]
    I --> I1[Quote]
    I --> I2[Author]
    I --> I3[Role]
    I --> I4[Avatar]
    
    style A fill:#3b82f6
    style B fill:#f59e0b
```

## Blog Architecture

```mermaid
graph TD
    A[Blog Collection] --> B[Blog Posts]
    
    B --> C[Content Fields]
    C --> C1[title]
    C --> C2[slug]
    C --> C3[excerpt]
    C --> C4[body: Lexical]
    
    B --> D[Media Fields]
    D --> D1[heroImage: 21:9]
    D --> D2[cardImage: 16:9]
    D --> D3[authorAvatar]
    
    B --> E[Metadata Fields]
    E --> E1[author]
    E --> E2[authorRole]
    E --> E3[category]
    E --> E4[tags]
    E --> E5[readingTime]
    E --> E6[publishedAt]
    
    B --> F[SEO Fields]
    F --> F1[title]
    F --> F2[description]
    F --> F3[keywords]
    F --> F4[ogImage]
    F --> F5[canonical]
    
    B --> G[Status]
    G --> G1[Draft]
    G --> G2[Published]
    
    style A fill:#3b82f6
    style B fill:#10b981
```

## File System Structure

```mermaid
graph TD
    A[apps/marketing/] --> B[lib/]
    A --> C[fields/]
    A --> D[blocks/]
    A --> E[collections/]
    A --> F[components/]
    A --> G[app/]
    A --> H[scripts/]
    
    B --> B1[locales.ts]
    B --> B2[workspace-links.ts]
    B --> B3[cms-pages.ts]
    B --> B4[cms-seo.ts]
    B --> B5[json-ld.ts]
    B --> B6[payload-api.ts]
    
    C --> C1[seoFields.ts]
    C --> C2[linkField.ts]
    
    D --> D1[Hero.ts]
    D --> D2[RichText.ts]
    D --> D3[FeatureGrid.ts]
    D --> D4[ImageText.ts]
    D --> D5[CTASection.ts]
    D --> D6[Stats.ts]
    D --> D7[Testimonial.ts]
    
    E --> E1[MarketingPages.ts]
    E --> E2[BlogPosts.ts]
    E --> E3[Media.ts]
    
    F --> F1[cms/]
    F --> F2[blog/]
    
    F1 --> F1A[page-renderer.tsx]
    F1 --> F1B[blocks/]
    
    F2 --> F2A[blog-card.tsx]
    F2 --> F2B[blog-detail.tsx]
    
    G --> G1[site/]
    G --> G2[payload/]
    
    G1 --> G1A[locale/]
    G1A --> G1A1[blog/]
    G1A --> G1A2[pricing/page-cms.tsx]
    G1A --> G1A3[about/page-cms.tsx]
    
    H --> H1[seed-cms.ts]
    
    style A fill:#3b82f6
```

## Deployment Architecture

```mermaid
graph LR
    A[Development] -->|SQLite| B[Local DB]
    C[Staging] -->|PostgreSQL| D[Staging DB]
    E[Production] -->|PostgreSQL| F[Production DB]
    
    G[Editor] --> A
    G --> C
    G --> E
    
    A --> H[Dev Server: 3005]
    C --> I[Staging Server]
    E --> J[Production Server]
    
    H --> K[Dev Admin]
    I --> L[Staging Admin]
    E --> M[Production Admin]
    
    N[Media Files] --> O[Local Storage: Dev]
    N --> P[S3/CDN: Production]
    
    style A fill:#10b981
    style C fill:#f59e0b
    style E fill:#ef4444
```

## Access Patterns

### Content Editor Flow
1. Login to `/admin`
2. Select collection (Blog Posts / Marketing Pages)
3. Create/Edit content
4. Add media (images, PDFs)
5. Configure SEO fields
6. Switch locale (EN/AR)
7. Save draft or publish
8. Preview on frontend

### User Flow
1. Visit marketing page (e.g., `/en/pricing`)
2. Next.js fetches CMS data
3. PageRenderer selects block components
4. Blocks render with design system
5. SEO metadata injected in `<head>`
6. JSON-LD added to page
7. User sees localized, accessible content

### Developer Flow
1. Define new block in `blocks/`
2. Create renderer in `components/cms/blocks/`
3. Register in `PageRenderer`
4. Add to `MarketingPages` collection
5. Test in admin panel
6. Deploy to production

---

## Key Design Decisions

### 1. Hybrid CMS Approach
- **CMS controls**: Content, SEO, media
- **Code controls**: Design, layout, components
- **Why**: Maintains design quality while enabling content flexibility

### 2. Block-Based Architecture
- **Reusable blocks**: 7 block types
- **Flexible composition**: Mix and match on pages
- **Why**: Consistency without rigidity

### 3. Locale-First Design
- **Not hardcoded**: Extensible locale system
- **Per-field localization**: Each field can be translated
- **Why**: Easy to add new languages

### 4. SEO as First-Class Citizen
- **Per-page SEO**: Every page/post has SEO fields
- **Structured data**: JSON-LD for all content types
- **Why**: Maximize search visibility

### 5. Graceful Fallbacks
- **CMS unavailable**: Falls back to static content
- **Missing fields**: Uses sensible defaults
- **Why**: Resilient system

---

## Performance Considerations

### Build Time
- Static generation for published content
- Incremental Static Regeneration (ISR) for updates
- On-demand revalidation via webhooks

### Runtime
- Server-side rendering for dynamic content
- Client-side navigation (Next.js App Router)
- Image optimization via Next.js Image

### Database
- SQLite for development (file-based)
- PostgreSQL for production (scalable)
- Connection pooling for performance

### Caching
- Page-level caching via Next.js
- CDN caching for static assets
- Stale-while-revalidate pattern

---

This architecture provides a scalable, maintainable foundation for the Qentrah marketing site with full CMS capabilities.
