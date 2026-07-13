import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";
import { workspaceAssets } from "@/lib/assets/workspace-assets";

const rootUrl = brandDomainUrl("root");
const workspaceUrl = brandDomainUrl("workspace");
const logoUrl = `${workspaceUrl}${workspaceAssets.brand.icon}`;
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
  "AI-first Work OS",
  "agency management",
  "project management",
  "CRM for agencies",
];
const primaryLinks = [
  {
    name: "Qentrah Workspace",
    description: "AI-first Work OS for agencies — clients, projects, tasks, and AI agents.",
    url: workspaceUrl,
  },
  {
    name: "Pricing",
    description: "Transparent pricing for teams of all sizes — Free, Pro, and Enterprise plans.",
    url: `${workspaceUrl}/en/pricing`,
  },
  {
    name: "About",
    description: "Meet the team behind Qentrah and our philosophy.",
    url: `${workspaceUrl}/en/about`,
  },
  {
    name: "Docs",
    description: "Public documentation for connecting AI agents to Qentrah Workspace.",
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
    inLanguage: ["ar", "en"],
    description: "منصة تشغيل ذكية للوكالات والشركات الخدمية — إدارة العملاء والمشاريع والمهام والتقويم مع وكلاء ذكاء اصطناعي.",
    keywords: trustedKeywords,
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
      priceCurrency: "USD",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${workspaceUrl}/#website`,
    url: workspaceUrl,
    name: brandProductName("workspace", "en"),
    alternateName: brandProductName("workspace", "ar"),
    inLanguage: ["en", "ar"],
    description: "AI-first Work OS for agencies — clients, projects, tasks, and AI agents in one workspace.",
    publisher: {
      "@type": "Organization",
      "@id": `${rootUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${workspaceUrl}/en/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${workspaceUrl}/#webpage`,
    url: workspaceUrl,
    name: brandProductName("workspace", "en"),
    alternateName: brandProductName("workspace", "ar"),
    inLanguage: ["en", "ar"],
    isPartOf: { "@id": `${workspaceUrl}/#website` },
    about: { "@id": `${workspaceUrl}/#software` },
    description: "AI-first Work OS for agencies — clients, projects, tasks, and AI agents in one workspace.",
  };

  const siteNavigation = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${workspaceUrl}/#site-navigation`,
    name: "Qentrah primary links",
    description: "Main pages and sections of the Qentrah Workspace platform.",
    itemListElement: primaryLinks.map((link, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: link.name,
      description: link.description,
      url: link.url,
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${workspaceUrl}/#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: brandLabel("ar"), item: rootUrl },
      { "@type": "ListItem", position: 2, name: brandProductName("workspace", "en"), item: workspaceUrl },
      { "@type": "ListItem", position: 3, name: "Pricing", item: `${workspaceUrl}/en/pricing` },
      { "@type": "ListItem", position: 4, name: "About", item: `${workspaceUrl}/en/about` },
      { "@type": "ListItem", position: 5, name: "Contact", item: `${workspaceUrl}/en/contact` },
      { "@type": "ListItem", position: 6, name: "Docs", item: `${workspaceUrl}/en/docs` },
    ],
  };

  return (
    <>
      <JsonLd data={app} />
      <JsonLd data={website} />
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
      ? "توثيق عام لربط وكلاء الذكاء الاصطناعي بمساحة عمل كانترا."
      : "Public documentation for connecting AI agents to Qentrah workspace data.",
    url: docsUrl,
    image: logoUrl,
    inLanguage: isArabic ? "ar" : "en",
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
