import type { Metadata } from "next";
import { brandDomainUrl, brandLabel, brandProductName } from "@qentrah/brand-identity";

export type PublicSeoLocale = "en" | "ar";

type PublicMetadataInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

const workspaceUrl = brandDomainUrl("workspace");
const logoUrl = `${workspaceUrl}/app-icon-512.png`;

export function publicSeoLocale(locale: string): PublicSeoLocale {
  return locale === "ar" ? "ar" : "en";
}

function localizedPath(locale: PublicSeoLocale, path: string) {
  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}

function absoluteUrl(locale: PublicSeoLocale, path: string) {
  return `${workspaceUrl}${localizedPath(locale, path)}`;
}

export function workspacePublicMetadata({
  locale,
  path,
  title,
  description,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: PublicMetadataInput): Metadata {
  const activeLocale = publicSeoLocale(locale);
  const alternateLocale = activeLocale === "ar" ? "en" : "ar";
  const url = absoluteUrl(activeLocale, path);
  const siteName = brandProductName("workspace", activeLocale);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "ar-SA": absoluteUrl("ar", path),
        ar: absoluteUrl("ar", path),
        "en-SA": absoluteUrl("en", path),
        en: absoluteUrl("en", path),
      },
    },
    openGraph: {
      type,
      url,
      siteName,
      title,
      description,
      locale: activeLocale === "ar" ? "ar_SA" : "en_SA",
      alternateLocale: [alternateLocale === "ar" ? "ar_SA" : "en_SA"],
      images: [
        {
          url: logoUrl,
          width: 512,
          height: 512,
          alt: `${brandLabel(activeLocale)} Workspace`,
        },
      ],
      publishedTime,
      modifiedTime,
      authors,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [logoUrl],
    },
  };
}

