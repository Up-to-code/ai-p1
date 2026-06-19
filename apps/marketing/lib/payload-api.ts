import { getPayloadClient } from "./payload";

export type PayloadLocale = "en" | "ar";

export type PayloadBlogPost = {
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
  heroImage?: {
    id: number;
    url: string;
    alt?: string;
    width: number;
    height: number;
  };
  cardImage?: {
    id: number;
    url: string;
    alt?: string;
    width: number;
    height: number;
  };
  authorAvatar?: {
    id: number;
    url: string;
    alt?: string;
    width: number;
    height: number;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: {
      id: number;
      url: string;
      alt?: string;
    };
    canonical?: string;
  };
};

export type PayloadLandingSection = {
  id: number;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  body: Record<string, unknown> | null;
  items: unknown;
  image?: {
    id: number;
    url: string;
    alt?: string;
  };
};

export type PayloadLegalPage = {
  id: number;
  slug: string;
  title: string;
  body: Record<string, unknown>;
};

export type PayloadTeamMember = {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  sortOrder: number;
  avatar?: {
    id: number;
    url: string;
    alt?: string;
  };
};

export type PayloadFAQ = {
  id: number;
  question: string;
  answer: Record<string, unknown>;
  sortOrder: number;
};

export type PayloadPricingPlan = {
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

export type PayloadResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
};

export async function getBlogPosts(
  locale: PayloadLocale = "en",
  page = 1,
  pageSize = 10,
): Promise<PayloadResponse<PayloadBlogPost>> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    locale,
    where: {
      _status: { equals: "published" },
    },
    sort: "-createdAt",
    page,
    limit: pageSize,
    depth: 1,
  });

  return {
    docs: result.docs.map((doc) => ({
      id: doc.id as number,
      title: doc.title as string,
      slug: doc.slug as string,
      excerpt: doc.excerpt as string,
      body: doc.body as Record<string, unknown>,
      author: doc.author as string,
      authorRole: (doc.authorRole as string) || undefined,
      category: (doc.category as string) || null,
      tags: (doc.tags as string[]) || null,
      readingTime: (doc.readingTime as number) || 5,
      publishedAt:
        (doc.publishedAt as string) ||
        (doc.createdAt as string) ||
        new Date().toISOString(),
      heroImage: doc.heroImage
        ? {
            id: (doc.heroImage as { id: number }).id,
            url: (doc.heroImage as { url: string }).url,
            alt: (doc.heroImage as { alt?: string }).alt,
            width: (doc.heroImage as { width: number }).width,
            height: (doc.heroImage as { height: number }).height,
          }
        : undefined,
      cardImage: doc.cardImage
        ? {
            id: (doc.cardImage as { id: number }).id,
            url: (doc.cardImage as { url: string }).url,
            alt: (doc.cardImage as { alt?: string }).alt,
            width: (doc.cardImage as { width: number }).width,
            height: (doc.cardImage as { height: number }).height,
          }
        : undefined,
      authorAvatar: doc.authorAvatar
        ? {
            id: (doc.authorAvatar as { id: number }).id,
            url: (doc.authorAvatar as { url: string }).url,
            alt: (doc.authorAvatar as { alt?: string }).alt,
            width: (doc.authorAvatar as { width: number }).width,
            height: (doc.authorAvatar as { height: number }).height,
          }
        : undefined,
      seo: doc.seo
        ? {
            title: (doc.seo as { title?: string }).title,
            description: (doc.seo as { description?: string }).description,
            keywords: (doc.seo as { keywords?: string }).keywords,
            ogImage: (
              doc.seo as { ogImage?: { id: number; url: string; alt?: string } }
            ).ogImage,
            canonical: (doc.seo as { canonical?: string }).canonical,
          }
        : undefined,
    })),
    totalDocs: result.totalDocs,
    limit: result.limit,
    page: result.page || 1,
    totalPages: result.totalPages,
  };
}

export async function getBlogPost(
  slug: string,
  locale: PayloadLocale = "en",
): Promise<PayloadBlogPost | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blog-posts",
    locale,
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 1,
  });

  const doc = result.docs[0];
  if (!doc) return null;

  return {
    id: doc.id as number,
    title: doc.title as string,
    slug: doc.slug as string,
    excerpt: doc.excerpt as string,
    body: doc.body as Record<string, unknown>,
    author: doc.author as string,
    authorRole: (doc.authorRole as string) || undefined,
    category: (doc.category as string) || null,
    tags: (doc.tags as string[]) || null,
    readingTime: (doc.readingTime as number) || 5,
    publishedAt:
      (doc.publishedAt as string) ||
      (doc.createdAt as string) ||
      new Date().toISOString(),
    heroImage: doc.heroImage
      ? {
          id: (doc.heroImage as { id: number }).id,
          url: (doc.heroImage as { url: string }).url,
          alt: (doc.heroImage as { alt?: string }).alt,
          width: (doc.heroImage as { width: number }).width,
          height: (doc.heroImage as { height: number }).height,
        }
      : undefined,
    cardImage: doc.cardImage
      ? {
          id: (doc.cardImage as { id: number }).id,
          url: (doc.cardImage as { url: string }).url,
          alt: (doc.cardImage as { alt?: string }).alt,
          width: (doc.cardImage as { width: number }).width,
          height: (doc.cardImage as { height: number }).height,
        }
      : undefined,
    authorAvatar: doc.authorAvatar
      ? {
          id: (doc.authorAvatar as { id: number }).id,
          url: (doc.authorAvatar as { url: string }).url,
          alt: (doc.authorAvatar as { alt?: string }).alt,
          width: (doc.authorAvatar as { width: number }).width,
          height: (doc.authorAvatar as { height: number }).height,
        }
      : undefined,
    seo: doc.seo
      ? {
          title: (doc.seo as { title?: string }).title,
          description: (doc.seo as { description?: string }).description,
          keywords: (doc.seo as { keywords?: string }).keywords,
          ogImage: (
            doc.seo as { ogImage?: { id: number; url: string; alt?: string } }
          ).ogImage,
          canonical: (doc.seo as { canonical?: string }).canonical,
        }
      : undefined,
  };
}

export async function getLandingSection(
  sectionKey: string,
  locale: PayloadLocale = "en",
): Promise<PayloadLandingSection | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "landing-sections",
    locale,
    where: {
      sectionKey: { equals: sectionKey },
    },
    limit: 1,
    depth: 1,
  });

  const doc = result.docs[0];
  if (!doc) return null;

  return {
    id: doc.id as number,
    sectionKey: doc.sectionKey as string,
    title: doc.title as string,
    subtitle: (doc.subtitle as string) || null,
    body: (doc.body as Record<string, unknown>) || null,
    items: doc.items || null,
    image: doc.image
      ? {
          id: (doc.image as { id: number }).id,
          url: (doc.image as { url: string }).url,
          alt: (doc.image as { alt?: string }).alt,
        }
      : undefined,
  };
}

export async function getLegalPage(
  slug: string,
  locale: PayloadLocale = "en",
): Promise<PayloadLegalPage | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "legal-pages",
    locale,
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    depth: 1,
  });

  const doc = result.docs[0];
  if (!doc) return null;

  return {
    id: doc.id as number,
    slug: doc.slug as string,
    title: doc.title as string,
    body: doc.body as Record<string, unknown>,
  };
}

export async function getTeamMembers(
  locale: PayloadLocale = "en",
): Promise<PayloadTeamMember[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "team-members",
    locale,
    sort: "sortOrder",
    depth: 1,
  });

  return result.docs.map((doc) => ({
    id: doc.id as number,
    name: doc.name as string,
    role: doc.role as string,
    bio: (doc.bio as string) || null,
    sortOrder: (doc.sortOrder as number) || 0,
    avatar: doc.avatar
      ? {
          id: (doc.avatar as { id: number }).id,
          url: (doc.avatar as { url: string }).url,
          alt: (doc.avatar as { alt?: string }).alt,
        }
      : undefined,
  }));
}

export async function getFAQs(
  locale: PayloadLocale = "en",
): Promise<PayloadFAQ[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "faqs",
    locale,
    sort: "sortOrder",
    depth: 1,
  });

  return result.docs.map((doc) => ({
    id: doc.id as number,
    question: doc.question as string,
    answer: doc.answer as Record<string, unknown>,
    sortOrder: (doc.sortOrder as number) || 0,
  }));
}

export async function getPricingPlans(
  locale: PayloadLocale = "en",
): Promise<PayloadPricingPlan[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pricing-plans",
    locale,
    depth: 1,
  });

  return result.docs.map((doc) => ({
    id: doc.id as number,
    name: doc.name as string,
    planId: doc.planId as string,
    amount: (doc.amount as number) || null,
    currency: (doc.currency as string) || "SAR",
    periodDays: (doc.periodDays as number) || 30,
    features: (doc.features as string[]) || null,
    highlighted: (doc.highlighted as boolean) || false,
    checkoutMode:
      (doc.checkoutMode as "provider" | "contact_sales") || "provider",
  }));
}

export function payloadMediaUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return url;
}
