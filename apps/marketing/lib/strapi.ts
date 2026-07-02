/**
 * Strapi v5 REST API client for Qentrah marketing.
 *
 * All functions run on the server only (no "use client" — never import this
 * in a client component). ISR revalidation is controlled per-call via the
 * `next.revalidate` fetch option.
 */

export type StrapiLocale = "en" | "ar";

// ── env ──────────────────────────────────────────────────────────────────────
const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, "") ?? "";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

if (!STRAPI_URL && process.env.NODE_ENV === "production") {
  console.warn("[strapi] STRAPI_URL is not set — all CMS calls will return null.");
}

// ── shared fetch helper ──────────────────────────────────────────────────────
async function strapiGet<T>(
  path: string,
  searchParams: Record<string, string> = {},
  revalidate: number | false = 3600,
): Promise<T | null> {
  if (!STRAPI_URL) return null;

  const url = new URL(`${STRAPI_URL}/api${path}`);
  for (const [k, v] of Object.entries(searchParams)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      next: revalidate === false ? { revalidate: false } : { revalidate },
    });

    if (!res.ok) {
      console.error(`[strapi] ${res.status} ${res.statusText} — ${url.toString()}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error("[strapi] fetch error:", err);
    return null;
  }
}

// ── shared Strapi response shapes ────────────────────────────────────────────
type StrapiAttributes = Record<string, unknown>;

type StrapiEntry<A extends StrapiAttributes = StrapiAttributes> = {
  id: number;
  attributes: A;
};

type StrapiCollection<A extends StrapiAttributes> = {
  data: StrapiEntry<A>[];
  meta: { pagination: { total: number; page: number; pageSize: number; pageCount: number } };
};

type StrapiSingle<A extends StrapiAttributes> = {
  data: StrapiEntry<A> | null;
};

// ── SEO component ─────────────────────────────────────────────────────────────
export type StrapiSeo = {
  title?: string;
  description?: string;
  keywords?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  image?: {
    data?: {
      id: number;
      attributes: { url: string; alternativeText?: string };
    };
  };
};

// ── Marketing page ────────────────────────────────────────────────────────────
export type StrapiMarketingPage = {
  id: number;
  title: string;
  slug: string;
  pageType: "home" | "pricing" | "about" | "contact" | "docs" | "generic";
  excerpt?: string;
  sections?: unknown[];
  publishedAt?: string;
  status: "draft" | "published";
  seo?: StrapiSeo;
};

type MarketingPageAttrs = {
  title: string;
  slug: string;
  pageType: StrapiMarketingPage["pageType"];
  excerpt?: string;
  sections?: unknown[];
  publishedAt?: string;
  status: "draft" | "published";
  seo?: StrapiSeo;
};

export async function getMarketingPage(
  slug: string,
  locale: StrapiLocale = "en",
): Promise<StrapiMarketingPage | null> {
  const data = await strapiGet<StrapiCollection<MarketingPageAttrs>>(
    "/marketing-pages",
    {
      "filters[slug][$eq]": slug,
      "filters[status][$eq]": "published",
      "populate[seo][populate]": "image",
      "populate": "sections,seo",
      locale,
    },
    3600,
  );

  const doc = data?.data?.[0];
  if (!doc) return null;

  const a = doc.attributes;
  return {
    id: doc.id,
    title: a.title,
    slug: a.slug,
    pageType: a.pageType,
    excerpt: a.excerpt,
    sections: a.sections,
    publishedAt: a.publishedAt,
    status: a.status,
    seo: a.seo,
  };
}

export async function getAllMarketingPages(
  locale: StrapiLocale = "en",
): Promise<StrapiMarketingPage[]> {
  const data = await strapiGet<StrapiCollection<MarketingPageAttrs>>(
    "/marketing-pages",
    { "filters[status][$eq]": "published", locale },
    3600,
  );

  return (data?.data ?? []).map((doc) => ({
    id: doc.id,
    title: doc.attributes.title,
    slug: doc.attributes.slug,
    pageType: doc.attributes.pageType,
    excerpt: doc.attributes.excerpt,
    publishedAt: doc.attributes.publishedAt,
    status: doc.attributes.status,
  }));
}

// ── Blog post ─────────────────────────────────────────────────────────────────
export type StrapiBlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: Record<string, unknown>;
  author: string;
  authorRole?: string;
  category: string | null;
  tags: string[] | null;
  readingTime: number;
  publishedAt: string;
  heroImage?: { url: string; alt?: string; width: number; height: number };
  cardImage?: { url: string; alt?: string; width: number; height: number };
  authorAvatar?: { url: string; alt?: string };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: { url: string; alt?: string };
    canonical?: string;
  };
};

type BlogPostAttrs = {
  title: string;
  slug: string;
  excerpt: string;
  body: Record<string, unknown>;
  author: string;
  authorRole?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
  publishedAt?: string;
  createdAt: string;
  heroImage?: { data?: { id: number; attributes: { url: string; alternativeText?: string; width: number; height: number } } };
  cardImage?: { data?: { id: number; attributes: { url: string; alternativeText?: string; width: number; height: number } } };
  authorAvatar?: { data?: { id: number; attributes: { url: string; alternativeText?: string } } };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogImage?: { data?: { id: number; attributes: { url: string; alternativeText?: string } } };
  };
};

function mapBlogPost(doc: StrapiEntry<BlogPostAttrs>): StrapiBlogPost {
  const a = doc.attributes;
  return {
    id: doc.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    body: a.body,
    author: a.author,
    authorRole: a.authorRole,
    category: a.category ?? null,
    tags: a.tags ?? null,
    readingTime: a.readingTime ?? 5,
    publishedAt: a.publishedAt ?? a.createdAt ?? new Date().toISOString(),
    heroImage: a.heroImage?.data
      ? { url: a.heroImage.data.attributes.url, alt: a.heroImage.data.attributes.alternativeText, width: a.heroImage.data.attributes.width, height: a.heroImage.data.attributes.height }
      : undefined,
    cardImage: a.cardImage?.data
      ? { url: a.cardImage.data.attributes.url, alt: a.cardImage.data.attributes.alternativeText, width: a.cardImage.data.attributes.width, height: a.cardImage.data.attributes.height }
      : undefined,
    authorAvatar: a.authorAvatar?.data
      ? { url: a.authorAvatar.data.attributes.url, alt: a.authorAvatar.data.attributes.alternativeText }
      : undefined,
    seo: a.seo
      ? {
          title: a.seo.title,
          description: a.seo.description,
          keywords: a.seo.keywords,
          canonical: a.seo.canonical,
          ogImage: a.seo.ogImage?.data
            ? { url: a.seo.ogImage.data.attributes.url, alt: a.seo.ogImage.data.attributes.alternativeText }
            : undefined,
        }
      : undefined,
  };
}

export type StrapiPaginatedResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
};

export async function getBlogPosts(
  locale: StrapiLocale = "en",
  page = 1,
  pageSize = 10,
): Promise<StrapiPaginatedResponse<StrapiBlogPost>> {
  const data = await strapiGet<StrapiCollection<BlogPostAttrs>>(
    "/blog-posts",
    {
      "filters[publishedAt][$notNull]": "true",
      "sort": "publishedAt:desc",
      "pagination[page]": String(page),
      "pagination[pageSize]": String(pageSize),
      "populate": "heroImage,cardImage,authorAvatar,seo.ogImage",
      locale,
    },
    3600,
  );

  const docs = (data?.data ?? []).map(mapBlogPost);
  const meta = data?.meta?.pagination;

  return {
    docs,
    totalDocs: meta?.total ?? docs.length,
    limit: meta?.pageSize ?? pageSize,
    page: meta?.page ?? page,
    totalPages: meta?.pageCount ?? Math.ceil((meta?.total ?? docs.length) / pageSize),
  };
}

export async function getBlogPost(
  slug: string,
  locale: StrapiLocale = "en",
): Promise<StrapiBlogPost | null> {
  const data = await strapiGet<StrapiCollection<BlogPostAttrs>>(
    "/blog-posts",
    {
      "filters[slug][$eq]": slug,
      "filters[publishedAt][$notNull]": "true",
      "pagination[pageSize]": "1",
      "populate": "heroImage,cardImage,authorAvatar,seo.ogImage",
      locale,
    },
    3600,
  );

  const doc = data?.data?.[0];
  return doc ? mapBlogPost(doc) : null;
}

// ── Landing section ────────────────────────────────────────────────────────────
export type StrapiLandingSection = {
  id: number;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  body: Record<string, unknown> | null;
  items: unknown;
  image?: { url: string; alt?: string };
};

type LandingSectionAttrs = {
  sectionKey: string;
  title: string;
  subtitle?: string;
  body?: Record<string, unknown>;
  items?: unknown;
  image?: { data?: { id: number; attributes: { url: string; alternativeText?: string } } };
};

export async function getLandingSection(
  sectionKey: string,
  locale: StrapiLocale = "en",
): Promise<StrapiLandingSection | null> {
  const data = await strapiGet<StrapiCollection<LandingSectionAttrs>>(
    "/landing-sections",
    {
      "filters[sectionKey][$eq]": sectionKey,
      "populate": "image",
      locale,
    },
    3600,
  );

  const doc = data?.data?.[0];
  if (!doc) return null;

  const a = doc.attributes;
  return {
    id: doc.id,
    sectionKey: a.sectionKey,
    title: a.title,
    subtitle: a.subtitle ?? null,
    body: a.body ?? null,
    items: a.items ?? null,
    image: a.image?.data
      ? { url: a.image.data.attributes.url, alt: a.image.data.attributes.alternativeText }
      : undefined,
  };
}

// ── Legal page ─────────────────────────────────────────────────────────────────
export type StrapiLegalPage = {
  id: number;
  slug: string;
  title: string;
  body: Record<string, unknown>;
};

type LegalPageAttrs = {
  slug: string;
  title: string;
  body: Record<string, unknown>;
};

export async function getLegalPage(
  slug: string,
  locale: StrapiLocale = "en",
): Promise<StrapiLegalPage | null> {
  const data = await strapiGet<StrapiCollection<LegalPageAttrs>>(
    "/legal-pages",
    { "filters[slug][$eq]": slug, locale },
    false,
  );

  const doc = data?.data?.[0];
  if (!doc) return null;

  return {
    id: doc.id,
    slug: doc.attributes.slug,
    title: doc.attributes.title,
    body: doc.attributes.body,
  };
}

// ── Team members ───────────────────────────────────────────────────────────────
export type StrapiTeamMember = {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  sortOrder: number;
  avatar?: { url: string; alt?: string };
};

type TeamMemberAttrs = {
  name: string;
  role: string;
  bio?: string;
  sortOrder?: number;
  avatar?: { data?: { id: number; attributes: { url: string; alternativeText?: string } } };
};

export async function getTeamMembers(
  locale: StrapiLocale = "en",
): Promise<StrapiTeamMember[]> {
  const data = await strapiGet<StrapiCollection<TeamMemberAttrs>>(
    "/team-members",
    { "sort": "sortOrder:asc", "populate": "avatar", locale },
    3600,
  );

  return (data?.data ?? []).map((doc) => ({
    id: doc.id,
    name: doc.attributes.name,
    role: doc.attributes.role,
    bio: doc.attributes.bio ?? null,
    sortOrder: doc.attributes.sortOrder ?? 0,
    avatar: doc.attributes.avatar?.data
      ? { url: doc.attributes.avatar.data.attributes.url, alt: doc.attributes.avatar.data.attributes.alternativeText }
      : undefined,
  }));
}

// ── FAQs ────────────────────────────────────────────────────────────────────────
export type StrapiFAQ = {
  id: number;
  question: string;
  answer: Record<string, unknown>;
  sortOrder: number;
};

type FAQAttrs = {
  question: string;
  answer: Record<string, unknown>;
  sortOrder?: number;
};

export async function getFAQs(locale: StrapiLocale = "en"): Promise<StrapiFAQ[]> {
  const data = await strapiGet<StrapiCollection<FAQAttrs>>(
    "/faqs",
    { "sort": "sortOrder:asc", locale },
    3600,
  );

  return (data?.data ?? []).map((doc) => ({
    id: doc.id,
    question: doc.attributes.question,
    answer: doc.attributes.answer,
    sortOrder: doc.attributes.sortOrder ?? 0,
  }));
}

// ── Pricing plans ───────────────────────────────────────────────────────────────
export type StrapiPricingPlan = {
  id: number;
  name: string;
  planId: string;
  amount: number | null;
  currency: string;
  periodDays: number;
  features: string[] | null;
  highlighted: boolean;
  checkoutMode: "provider" | "contact_sales";
};

type PricingPlanAttrs = {
  name: string;
  planId: string;
  amount?: number;
  currency: string;
  periodDays: number;
  features?: string[];
  highlighted: boolean;
  checkoutMode: "provider" | "contact_sales";
};

export async function getPricingPlans(
  locale: StrapiLocale = "en",
): Promise<StrapiPricingPlan[]> {
  const data = await strapiGet<StrapiCollection<PricingPlanAttrs>>(
    "/pricing-plans",
    { locale },
    3600,
  );

  return (data?.data ?? []).map((doc) => ({
    id: doc.id,
    name: doc.attributes.name,
    planId: doc.attributes.planId,
    amount: doc.attributes.amount ?? null,
    currency: doc.attributes.currency,
    periodDays: doc.attributes.periodDays,
    features: doc.attributes.features ?? null,
    highlighted: doc.attributes.highlighted,
    checkoutMode: doc.attributes.checkoutMode,
  }));
}
