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
  const isArabic = locale === "ar";
  const keywords = isArabic
    ? [
        "كانترا",
        "مساحة عمل عقارية",
        "CRM عقاري",
        "إدارة المشاريع العقارية",
        "إدارة المخزون العقاري",
        "إدارة العملاء العقاريين",
        "المطورون العقاريون",
        "الوسطاء العقاريون",
        "المعاينات العقارية",
        "السوق العقاري السعودي",
        "بيانات عقارية موثوقة",
      ]
    : [
        "Qentrah",
        "Saudi real estate workspace",
        "real estate CRM",
        "property inventory management",
        "project readiness",
        "broker coordination",
        "developer workflow",
        "client follow-ups",
        "viewing management",
        "verified real estate data",
      ];

  return {
    title: isArabic
      ? "كانترا | مساحة عمل عقارية CRM للمشاريع والعقارات في السعودية"
      : copy.home.title,
    description: isArabic
      ? "كانترا منصة مساحة عمل عقارية سعودية لإدارة العملاء والمشاريع والعقارات وعمليات CRM وتكاملات الشركاء."
      : "Qentrah is a Saudi real estate workspace for CRM, properties, projects, daily operations, and partner integrations.",
    keywords,
    alternates: {
      canonical: path,
      languages: {
        "ar-SA": "/ar",
        ar: "/ar",
        "en-SA": "/en",
        en: "/en",
        "x-default": "/ar",
      },
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: brand,
      title: isArabic
        ? "كانترا | مساحة عمل عقارية CRM للمشاريع والعقارات في السعودية"
        : copy.home.title,
      description: isArabic
        ? "كانترا منصة مساحة عمل عقارية سعودية لإدارة العملاء والمشاريع والعقارات وعمليات CRM وتكاملات الشركاء."
        : "Qentrah is a Saudi real estate workspace for CRM, properties, projects, daily operations, and partner integrations.",
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
      title: isArabic
        ? "كانترا | مساحة عمل عقارية CRM للمشاريع والعقارات في السعودية"
        : copy.home.title,
      description: isArabic
        ? "كانترا منصة مساحة عمل عقارية سعودية لإدارة العملاء والمشاريع والعقارات وعمليات CRM وتكاملات الشركاء."
        : "Qentrah is a Saudi real estate workspace for CRM, properties, projects, daily operations, and partner integrations.",
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
