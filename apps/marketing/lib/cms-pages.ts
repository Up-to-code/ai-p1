import { getPayloadClient } from "./payload";
import type { LocaleCode } from "./locales";

export type CMSPage = {
  id: number;
  title: string;
  slug: string;
  pageType: "home" | "pricing" | "about" | "contact" | "docs" | "generic";
  excerpt?: string;
  sections?: unknown[];
  publishedAt?: string;
  status: "draft" | "published";
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: {
      id: number;
      url: string;
      alt?: string;
    };
    noIndex?: boolean;
    canonicalUrl?: string;
  };
};

/**
 * Get a marketing page by slug and locale
 */
export async function getMarketingPage(
  slug: string,
  locale: LocaleCode = "en"
): Promise<CMSPage | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "marketing-pages",
      locale,
      where: {
        slug: { equals: slug },
        status: { equals: "published" },
      },
      limit: 1,
      depth: 2,
    });

    const doc = result.docs[0];
    if (!doc) return null;

    return {
      id: doc.id as number,
      title: doc.title as string,
      slug: doc.slug as string,
      pageType: doc.pageType as CMSPage["pageType"],
      excerpt: doc.excerpt as string | undefined,
      sections: doc.sections as unknown[] | undefined,
      publishedAt: doc.publishedAt as string | undefined,
      status: doc.status as "draft" | "published",
      seo: doc.seo
        ? {
            title: (doc.seo as { title?: string }).title,
            description: (doc.seo as { description?: string }).description,
            keywords: (doc.seo as { keywords?: string }).keywords,
            image: (doc.seo as { image?: { id: number; url: string; alt?: string } }).image,
            noIndex: (doc.seo as { noIndex?: boolean }).noIndex,
            canonicalUrl: (doc.seo as { canonicalUrl?: string }).canonicalUrl,
          }
        : undefined,
    };
  } catch (error) {
    console.error(`Error fetching marketing page "${slug}":`, error);
    return null;
  }
}

/**
 * Get all published marketing pages
 */
export async function getAllMarketingPages(
  locale: LocaleCode = "en"
): Promise<CMSPage[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "marketing-pages",
      locale,
      where: {
        status: { equals: "published" },
      },
      depth: 1,
    });

    return result.docs.map((doc) => ({
      id: doc.id as number,
      title: doc.title as string,
      slug: doc.slug as string,
      pageType: doc.pageType as CMSPage["pageType"],
      excerpt: doc.excerpt as string | undefined,
      publishedAt: doc.publishedAt as string | undefined,
      status: doc.status as "draft" | "published",
    }));
  } catch (error) {
    console.error("Error fetching all marketing pages:", error);
    return [];
  }
}
