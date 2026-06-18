import type { Metadata } from "next";
import { brandDomainUrl, brandIdentity, brandLabel } from "@qentrah/brand-identity";

import { getContent, getMarketingMessages, getWorkspaceLanding, locales, type LegalBlockBody, type Locale } from "@/lib/content";
import { publicSeoLinks } from "@/lib/public-links";

const siteUrl = brandDomainUrl("root");

const localeLanguages = {
  "ar-SA": "/ar",
  ar: "/ar",
  "en-SA": "/en",
  en: "/en",
  "x-default": "/ar",
} as const;

function localizedPath(locale: Locale, path = "") {
  const cleanPath = path ? `/${path.replace(/^\/+/u, "")}` : "";
  return `/${locale}${cleanPath}`;
}

export function localizedLanguages(path = "", absolute = false) {
  return Object.fromEntries(
    Object.entries(localeLanguages).map(([language, localePath]) => {
      const href = `${localePath}${path ? `/${path.replace(/^\/+/u, "")}` : ""}`;
      return [language, absolute ? `${siteUrl}${href}` : href];
    }),
  );
}

function marketingTitle(locale: Locale) {
  return getMarketingMessages(locale).Landing.home.hero.title;
}

function marketingDescription(locale: Locale) {
  return getMarketingMessages(locale).Landing.home.hero.description;
}

function marketingKeywords(locale: Locale) {
  const copy = getContent(locale);

  return [
    copy.nav.brand,
    copy.nav.workspace,
    copy.nav.partners,
    ...publicSeoLinks.flatMap((link) => [link.labels[locale], link.descriptions[locale]]),
    copy.legal.privacyTitle,
    copy.legal.termsTitle,
    copy.legal.legalTitle,
  ];
}

function marketingIcons(): Metadata["icons"] {
  return {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/mask-icon.svg", color: brandIdentity.colors.primary }],
  };
}

export function rootMarketingMetadata(locale: Locale = "ar"): Metadata {
  const brand = brandLabel(locale);
  const title = marketingTitle(locale);
  const description = marketingDescription(locale);

  return {
    metadataBase: new URL(siteUrl),
    applicationName: brand,
    title: {
      default: title,
      template: `%s | ${brand}`,
    },
    description,
    keywords: marketingKeywords(locale),
    manifest: "/manifest.webmanifest",
    icons: marketingIcons(),
    authors: [{ name: brand }],
    creator: brand,
    publisher: brand,
    alternates: {
      canonical: localizedPath(locale),
      languages: localeLanguages,
    },
    openGraph: {
      type: "website",
      url: localizedPath(locale),
      siteName: brand,
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SA"],
      images: [
        {
          url: "/app-icon-512.png",
          width: 512,
          height: 512,
          alt: `${brand} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/app-icon-512.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    appleWebApp: {
      capable: true,
      title: brand,
      statusBarStyle: "default",
    },
  };
}

export function localizedMarketingMetadata(locale: Locale, path = ""): Metadata {
  const { description, title } = marketingPageSeo(locale, path);
  const canonical = localizedPath(locale, path);
  const brand = brandLabel(locale);

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: marketingKeywords(locale),
    alternates: {
      canonical,
      languages: localizedLanguages(path),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: brand,
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SA"],
      images: [
        {
          url: "/app-icon-512.png",
          width: 512,
          height: 512,
          alt: `${brand} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/app-icon-512.png"],
    },
  };
}

function marketingPageSeo(locale: Locale, path: string) {
  const copy = getContent(locale);
  const landing = getWorkspaceLanding(locale);
  const normalizedPath = path.replace(/^\/+/u, "");

  const sitelink = publicSeoLinks.find((link) => link.href.replace(/^\/+/u, "") === normalizedPath);
  if (sitelink) {
    return {
      title: sitelink.labels[locale],
      description: sitelink.descriptions[locale],
    };
  }

  if (normalizedPath === "docs") {
    return {
      title: locale === "ar" ? "توثيق كانترا" : "Qentrah Docs",
      description:
        locale === "ar"
          ? "توثيق عام لربط مساحة عمل كانترا بالوكلاء والتطبيقات وتدفقات التشغيل العقاري."
          : "Public documentation for connecting Qentrah Workspace with agents, apps, and real estate operating workflows.",
    };
  }

  if (normalizedPath === "billing") {
    return {
      title: locale === "ar" ? "اشتراك كانترا" : "Qentrah Billing",
      description:
        locale === "ar"
          ? "إدارة اشتراك مساحة العمل وخطط التشغيل العقاري في كانترا."
          : "Manage Qentrah Workspace billing and real estate operating plans.",
    };
  }

  if (normalizedPath === "privacy") {
    return {
      title: copy.legal.privacyTitle,
      description: legalDescription(copy.legal.privacy[0].body),
    };
  }

  if (normalizedPath === "terms") {
    return {
      title: copy.legal.termsTitle,
      description: legalDescription(copy.legal.terms[0].body),
    };
  }

  if (normalizedPath === "legal") {
    return {
      title: copy.legal.legalTitle,
      description: legalDescription(copy.legal.legal[0].body),
    };
  }

  if (normalizedPath === "about" || normalizedPath === "developer" || normalizedPath === "broker" || normalizedPath === "contact") {
    return {
      title: landing[normalizedPath].hero.title,
      description: landing[normalizedPath].hero.description,
    };
  }

  return {
    title: marketingTitle(locale),
    description: marketingDescription(locale),
  };
}

function legalDescription(body: LegalBlockBody) {
  if (typeof body === "string") return body.split("\n\n")[0] ?? body;

  const first = body.find((item) => typeof item === "string");
  return typeof first === "string" ? first : body.flat().join(" ");
}

const marketingSitemapPaths = [
  "",
  "pricing",
  "dashboard",
  "partners",
  "developer",
  "broker",
  "contact",
  "about",
  "docs",
  "billing",
  "privacy",
  "terms",
  "legal",
] as const;

export function marketingSitemapPriority(path: string) {
  if (path === "") return 1;
  if (publicSeoLinks.some((link) => link.href.replace(/^\/+/u, "") === path)) return 0.85;
  if (path === "docs") return 0.75;
  return 0.6;
}

export function allLocalizedMarketingPaths() {
  return locales.flatMap((locale) =>
    marketingSitemapPaths.map((path) => ({
      locale,
      path,
      url: `${siteUrl}${localizedPath(locale, path)}`,
    })),
  );
}
