import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";

const rootUrl = brandDomainUrl("root");
const workspaceUrl = brandDomainUrl("workspace");
const logoUrl = `${workspaceUrl}/app-icon-512.png`;
const trustedKeywords = [
  "مساحة عمل تشغيلية",
  "إدارة العملاء",
  "إدارة المشاريع",
  "إدارة الأصول",
  "إدارة المهام",
  "تقويم الأعمال",
  "مسارات العملاء",
  "تكاملات الذكاء الاصطناعي",
  "workspace operating system",
  "client operations",
  "asset management",
  "project workflow",
];
const primaryLinks = [
  {
    name: "Qentrah Workspace",
    description: "Enter the public Qentrah Workspace overview for business operations.",
    url: workspaceUrl,
  },
  {
    name: "Developers",
    description: "See how development teams prepare projects and verified inventory in Qentrah.",
    url: `${workspaceUrl}/en/developer`,
  },
  {
    name: "Brokers",
    description: "See how brokers manage clients, viewings, and live inventory in Qentrah.",
    url: `${workspaceUrl}/en/broker`,
  },
  {
    name: "Docs",
    description: "Read public documentation for connecting AI agents to Qentrah Workspace.",
    url: `${workspaceUrl}/en/docs`,
  },
  {
    name: "Contact",
    description: "Contact Qentrah to map your workspace workflow.",
    url: `${workspaceUrl}/en/contact`,
  },
] as const;

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
    description: "مساحة عمل تشغيلية لإدارة العملاء والمشاريع والأصول والتقويم والمهام من مصدر واحد موثوق.",
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

  const siteNavigation = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${workspaceUrl}/#site-navigation`,
    name: "Qentrah Workspace primary links",
    itemListElement: primaryLinks.map((link, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: link.name,
      description: link.description,
      url: link.url,
    })),
  };

  return (
    <>
      <JsonLd data={app} />
      <JsonLd data={webPage} />
      <JsonLd data={siteNavigation} />
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
      ? "توثيق عام لربط وكلاء الذكاء الاصطناعي بمساحة عمل كانترا في السعودية."
      : "Public documentation for connecting AI agents to Qentrah workspace data.",
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
