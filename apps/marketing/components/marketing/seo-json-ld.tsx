import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";

import type { Locale } from "@/lib/content";

const rootUrl = brandDomainUrl("root");
const workspaceUrl = brandDomainUrl("workspace");
const partnersUrl = brandDomainUrl("partners");
const logoUrl = `${workspaceUrl}/app-icon-512.png`;
const trustedArabicKeywords = [
  "مساحة عمل عقارية",
  "CRM عقاري",
  "إدارة العملاء العقاريين",
  "إدارة المشاريع العقارية",
  "إدارة المخزون العقاري",
  "المطورون العقاريون",
  "الوسطاء العقاريون",
  "المعاينات العقارية",
  "السوق العقاري السعودي",
  "بيانات عقارية موثوقة",
];
const trustedEnglishKeywords = [
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

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</gu, "\\u003c") }}
    />
  );
}

export function MarketingHomeJsonLd({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const url = `${rootUrl}/${locale}`;
  const name = brandLabel(locale);
  const description = isArabic
    ? "كانترا مساحة عمل عقارية سعودية لإدارة العملاء والمشاريع والمخزون العقاري والمعاينات وعمليات CRM، وتوحيد بيانات المطورين والوسطاء من مصدر واحد موثوق."
    : "Qentrah is a Saudi real estate workspace for CRM, projects, verified inventory, viewings, broker coordination, developer workflows, and partner integrations.";
  const keywords = isArabic ? trustedArabicKeywords : trustedEnglishKeywords;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${rootUrl}/#organization`,
    name,
    legalName: brandIdentity.legalName[locale],
    url: rootUrl,
    logo: logoUrl,
    email: brandIdentity.domains.email,
    keywords,
    areaServed: {
      "@type": "Country",
      name: isArabic ? "السعودية" : "Saudi Arabia",
      identifier: "SA",
    },
    sameAs: [workspaceUrl, partnersUrl],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${rootUrl}/#website`,
    name,
    url: rootUrl,
    inLanguage: isArabic ? "ar-SA" : "en-SA",
    keywords,
    publisher: { "@id": `${rootUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${rootUrl}/${locale}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${rootUrl}/#software`,
    name: brandProductName("workspace", locale),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: workspaceUrl,
    image: logoUrl,
    inLanguage: isArabic ? "ar-SA" : "en-SA",
    description,
    keywords,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
    areaServed: {
      "@type": "Country",
      identifier: "SA",
      name: isArabic ? "السعودية" : "Saudi Arabia",
    },
    publisher: { "@id": `${rootUrl}/#organization` },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isArabic ? "الرئيسية" : "Home",
        item: url,
      },
    ],
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <JsonLd data={app} />
      <JsonLd data={breadcrumbs} />
    </>
  );
}
