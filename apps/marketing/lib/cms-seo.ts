import type { Metadata } from "next";
import type { CMSPage } from "./cms-pages";

/**
 * Generate Next.js metadata from CMS page SEO fields
 */
export function generateCMSMetadata(page: CMSPage): Metadata {
  const title = page.seo?.title || page.title;
  const description = page.seo?.description || page.excerpt || "";

  return {
    title,
    description,
    keywords: page.seo?.keywords,
    openGraph: {
      title,
      description,
      type: "website",
      images: page.seo?.image
        ? [
            {
              url: page.seo.image.url,
              alt: page.seo.image.alt || title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: page.seo?.image ? [page.seo.image.url] : undefined,
    },
    robots: {
      index: !page.seo?.noIndex,
      follow: !page.seo?.noIndex,
    },
    alternates: page.seo?.canonicalUrl
      ? {
          canonical: page.seo.canonicalUrl,
        }
      : undefined,
  };
}

/**
 * Generate fallback metadata when CMS page is not found
 */
export function generateFallbackMetadata(
  slug: string,
  locale: string
): Metadata {
  const isAr = locale === "ar";

  const fallbacks: Record<string, { en: { title: string; description: string }; ar: { title: string; description: string } }> = {
    pricing: {
      en: {
        title: "Pricing | Qentrah",
        description: "Transparent and flexible pricing for Qentrah",
      },
      ar: {
        title: "التسعير | Qentrah",
        description: "تسعير شفاف ومرن لمنصة كانترا",
      },
    },
    about: {
      en: {
        title: "About | Qentrah",
        description: "Qentrah is an AI-first Work OS for agencies",
      },
      ar: {
        title: "عن كانترا | Qentrah",
        description: "كانترا هي منصة تشغيل ذكية للوكالات",
      },
    },
    contact: {
      en: {
        title: "Contact | Qentrah",
        description: "Get in touch with the Qentrah team",
      },
      ar: {
        title: "اتصل بنا | Qentrah",
        description: "تواصل مع فريق كانترا",
      },
    },
    docs: {
      en: {
        title: "Documentation | Qentrah",
        description: "Public documentation for Qentrah Workspace",
      },
      ar: {
        title: "التوثيق | Qentrah",
        description: "توثيق عام لربط مساحة عمل كانترا",
      },
    },
    home: {
      en: {
        title: "Qentrah | AI-first Work OS",
        description: "The intelligent workspace for agencies and professional service firms",
      },
      ar: {
        title: "كانترا | منصة التشغيل الذكية",
        description: "مساحة العمل الذكية للوكالات والشركات الخدمية",
      },
    },
  };

  const fallback = fallbacks[slug];
  if (!fallback) {
    return {
      title: isAr ? "كانترا | Qentrah" : "Qentrah",
      description: isAr
        ? "منصة التشغيل الذكية"
        : "AI-first Work OS",
    };
  }

  const { title, description } = isAr ? fallback.ar : fallback.en;
  return { title, description };
}
