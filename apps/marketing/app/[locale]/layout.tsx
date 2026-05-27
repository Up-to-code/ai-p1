import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { brandDomainUrl, brandLabel } from "@qentrah/brand-identity";

import { LocaleDocumentAttributes } from "@/components/marketing/locale-document-attributes";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-shell";
import { getContent, getDirection, isLocale, type Locale } from "@/lib/content";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const locale: Locale = localeParam;
  const copy = getContent(locale);
  const brand = brandLabel(locale);
  const path = `/${locale}`;
  const image = new URL("/app-icon-512.png", brandDomainUrl("workspace")).toString();

  return {
    title: copy.home.title,
    description: copy.home.description,
    alternates: {
      canonical: path,
      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: brand,
      title: copy.home.title,
      description: copy.home.description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SA"],
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: `${brand} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: copy.home.title,
      description: copy.home.description,
      images: [image],
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale: Locale = localeParam;
  const copy = getContent(locale);

  return (
    <div dir={getDirection(locale)} lang={locale}>
      <LocaleDocumentAttributes locale={locale} />
      <SiteHeader locale={locale} nav={copy.nav} />
      {children}
      <SiteFooter locale={locale} nav={copy.nav} />
    </div>
  );
}
