import { brandDomainUrl, brandLabel } from "@qentrah/brand-identity";
import type { StrapiBlogPost } from "./strapi";
import type { Locale } from "./content";

const siteUrl = brandDomainUrl("root");

export type JsonLd = Record<string, unknown>;

export function organizationSchema(locale: Locale): JsonLd {
  const brand = brandLabel(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand,
    url: siteUrl,
    logo: `${siteUrl}/app-icon-512.png`,
    description:
      locale === "ar"
        ? "منصة قنطرة لإدارة الأعمال والشراكات"
        : "Qentrah - Business and Partnership Management Platform",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      url: `${siteUrl}/${locale}/contact`,
    },
    sameAs: [],
  };
}

export function websiteSchema(locale: Locale): JsonLd {
  const brand = brandLabel(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand,
    url: siteUrl,
    description:
      locale === "ar"
        ? "منصة قنطرة لإدارة الأعمال والشراكات"
        : "Qentrah - Business and Partnership Management Platform",
    inLanguage: locale === "ar" ? "ar" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleSchema(post: StrapiBlogPost, locale: Locale): JsonLd {
  const brand = brandLabel(locale);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.heroImage ? post.heroImage.url : `${siteUrl}/app-icon-512.png`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
      ...(post.authorRole ? { jobTitle: post.authorRole } : {}),
      ...(post.authorAvatar ? { image: post.authorAvatar.url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: brand,
      logo: { "@type": "ImageObject", url: `${siteUrl}/app-icon-512.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/${locale}/blog/${post.slug}`,
    },
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.tags ? { keywords: post.tags.join(", ") } : {}),
  };
}

export function breadcrumbSchema(
  locale: Locale,
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function pricingOfferSchema(
  locale: Locale,
  plan: { name: string; description: string; price: number | null; currency: string; features: string[] },
): JsonLd {
  const brand = brandLabel(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    description: plan.description,
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "Offer",
      priceCurrency: plan.currency,
      ...(plan.price !== null ? { price: plan.price } : {}),
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/${locale}/pricing`,
    },
    ...(plan.features.length > 0
      ? { additionalProperty: plan.features.map((f) => ({ "@type": "PropertyValue", name: "Feature", value: f })) }
      : {}),
  };
}

export function jsonLdScript(jsonLd: JsonLd | JsonLd[]): string {
  const data = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  return JSON.stringify(data.length === 1 ? data[0] : data);
}
