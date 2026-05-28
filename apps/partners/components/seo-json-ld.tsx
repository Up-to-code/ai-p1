import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";

const partnersUrl = brandDomainUrl("partners");
const rootUrl = brandDomainUrl("root");
const workspaceUrl = brandDomainUrl("workspace");
const logoUrl = `${partnersUrl}/app-icon-512.png`;
const trustedKeywords = [
  "Saudi real estate workspace",
  "real estate CRM",
  "property inventory management",
  "project readiness",
  "broker coordination",
  "developer workflow",
  "verified inventory",
  "workspace integrations",
  "مساحة عمل عقارية",
  "إدارة المخزون العقاري",
  "المطورون العقاريون",
  "الوسطاء العقاريون",
];
const primaryLinks = [
  {
    name: "Qentrah Partners",
    description: "Build and submit Qentrah partner apps for Workspace authorization.",
    url: partnersUrl,
  },
  {
    name: "Documentation",
    description: "Read OAuth, SDK, and partner API integration guides.",
    url: `${partnersUrl}/docs`,
  },
  {
    name: "Pricing",
    description: "Review partner program pricing and platform access.",
    url: `${partnersUrl}/pricing`,
  },
  {
    name: "Security",
    description: "Review Qentrah partner integration security controls.",
    url: `${partnersUrl}/security`,
  },
  {
    name: "Support",
    description: "Get help with partner apps, reviews, and integrations.",
    url: `${partnersUrl}/support`,
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

export function PartnersMarketingJsonLd() {
  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${partnersUrl}/#software`,
    name: brandProductName("partners", "en"),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: partnersUrl,
    image: logoUrl,
    inLanguage: "en-SA",
    description: "Developer portal for Saudi real estate workspace integrations around verified inventory, project readiness, broker coordination, and developer workflows.",
    keywords: trustedKeywords,
    publisher: {
      "@type": "Organization",
      "@id": `${rootUrl}/#organization`,
      name: brandLabel("en"),
      legalName: brandIdentity.legalName.en,
      url: rootUrl,
      logo: `${workspaceUrl}/app-icon-512.png`,
      areaServed: { "@type": "Country", identifier: "SA", name: "Saudi Arabia" },
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${partnersUrl}/#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Qentrah", item: rootUrl },
      { "@type": "ListItem", position: 2, name: "Partners", item: partnersUrl },
    ],
  };

  const siteNavigation = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${partnersUrl}/#site-navigation`,
    name: "Qentrah Partners primary links",
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
      <JsonLd data={siteNavigation} />
      <JsonLd data={breadcrumbs} />
    </>
  );
}

export function PartnersDocsJsonLd() {
  const docsUrl = `${partnersUrl}/docs`;
  const docs = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${docsUrl}#techarticle`,
    headline: "Qentrah Partners documentation",
    name: "Qentrah Partners documentation",
    description: "Technical documentation for OAuth apps, partner APIs, and workspace authorization integrations.",
    url: docsUrl,
    image: logoUrl,
    inLanguage: "en-SA",
    keywords: trustedKeywords,
    about: brandProductName("partners", "en"),
    author: {
      "@type": "Organization",
      "@id": `${rootUrl}/#organization`,
      name: brandLabel("en"),
      url: rootUrl,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${rootUrl}/#organization`,
      name: brandLabel("en"),
      logo: { "@type": "ImageObject", url: `${workspaceUrl}/app-icon-512.png` },
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${docsUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Qentrah", item: rootUrl },
      { "@type": "ListItem", position: 2, name: "Partners", item: partnersUrl },
      { "@type": "ListItem", position: 3, name: "Docs", item: docsUrl },
    ],
  };

  return (
    <>
      <JsonLd data={docs} />
      <JsonLd data={breadcrumbs} />
    </>
  );
}
