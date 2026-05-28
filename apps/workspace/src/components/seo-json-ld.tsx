import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";

const rootUrl = brandDomainUrl("root");
const workspaceUrl = brandDomainUrl("workspace");
const logoUrl = `${workspaceUrl}/app-icon-512.png`;
const trustedKeywords = [
  "مساحة عمل عقارية",
  "CRM عقاري",
  "إدارة المشاريع العقارية",
  "إدارة المخزون العقاري",
  "إدارة العملاء العقاريين",
  "المعاينات العقارية",
  "المطورون العقاريون",
  "الوسطاء العقاريون",
  "بيانات عقارية موثوقة",
  "Saudi real estate workspace",
  "verified inventory",
  "broker coordination",
  "developer workflow",
];

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</gu, "\\u003c") }}
    />
  );
}

export function WorkspacePublicJsonLd() {
  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${workspaceUrl}/#software`,
    name: brandProductName("workspace", "ar"),
    alternateName: brandProductName("workspace", "en"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: workspaceUrl,
    image: logoUrl,
    inLanguage: ["ar-SA", "en-SA"],
    description: "مساحة عمل عقارية سعودية لإدارة العملاء والمشاريع والمخزون العقاري والمعاينات وعمليات CRM من مصدر واحد موثوق للمطورين والوسطاء.",
    keywords: trustedKeywords,
    areaServed: {
      "@type": "Country",
      identifier: "SA",
      name: "السعودية",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${rootUrl}/#organization`,
      name: brandLabel("ar"),
      legalName: brandIdentity.legalName.ar,
      url: rootUrl,
      logo: logoUrl,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${workspaceUrl}/#webpage`,
    url: workspaceUrl,
    name: brandProductName("workspace", "ar"),
    inLanguage: ["ar-SA", "en-SA"],
    isPartOf: { "@id": `${rootUrl}/#website` },
    about: { "@id": `${workspaceUrl}/#software` },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${workspaceUrl}/#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: brandLabel("ar"), item: rootUrl },
      { "@type": "ListItem", position: 2, name: brandProductName("workspace", "ar"), item: workspaceUrl },
    ],
  };

  return (
    <>
      <JsonLd data={app} />
      <JsonLd data={webPage} />
      <JsonLd data={breadcrumbs} />
    </>
  );
}

export function WorkspaceDocsJsonLd({ locale }: { locale: string }) {
  const isArabic = locale === "ar";
  const docsUrl = `${workspaceUrl}/${isArabic ? "ar" : "en"}/docs`;
  const data = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${docsUrl}#techarticle`,
    headline: isArabic ? "توثيق وكلاء MCP في كانترا" : "Qentrah MCP agent documentation",
    description: isArabic
      ? "توثيق عام لربط وكلاء الذكاء الاصطناعي بمساحة عمل كانترا العقارية في السعودية."
      : "Public documentation for connecting AI agents to Qentrah real estate workspace data in Saudi Arabia.",
    url: docsUrl,
    image: logoUrl,
    inLanguage: isArabic ? "ar-SA" : "en-SA",
    about: { "@id": `${workspaceUrl}/#software` },
    publisher: {
      "@type": "Organization",
      "@id": `${rootUrl}/#organization`,
      name: brandLabel(isArabic ? "ar" : "en"),
      logo: { "@type": "ImageObject", url: logoUrl },
    },
  };

  return <JsonLd data={data} />;
}
