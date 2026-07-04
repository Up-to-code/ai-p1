import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";

import { getContent, getWorkspaceLanding, type Locale } from "@/lib/content";
import { publicSeoLinks } from "@/lib/public-links";

const rootUrl = brandDomainUrl("root");
const workspaceUrl = brandDomainUrl("workspace");
const partnersUrl = brandDomainUrl("partners");
const logoUrl = `${rootUrl}/logo.ico`;

import Script from "next/script";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Script
      id={`json-ld-${(data["@type"] as string) ?? "unknown"}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</gu, "\\u003c") }}
      strategy="beforeInteractive"
    />
  );
}

export function MarketingHomeJsonLd({ locale }: { locale: Locale }) {
  const langCode = locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en";
  const isArabic = locale === "ar";
  const url = `${rootUrl}/${locale}`;
  const name = brandLabel(locale);
  const copy = getContent(locale);
  const landing = getWorkspaceLanding(locale);
  const description = landing.home.hero.description;
  const keywords = [copy.nav.brand, copy.nav.workspace, copy.nav.partners];

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
    // Global market — no country restriction
    sameAs: [workspaceUrl, partnersUrl],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${rootUrl}/#website`,
    name,
    url: rootUrl,
    inLanguage: langCode,
    keywords,
    publisher: { "@id": `${rootUrl}/#organization` },
  };

  const siteNavigation = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#site-navigation`,
    name: isArabic ? "روابط كانترا الرئيسية" : locale === "fr" ? "Liens principaux de Qentrah" : "Qentrah primary links",
    itemListElement: publicSeoLinks.map((link, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: link.labels[locale],
      description: link.descriptions[locale],
      url: `${rootUrl}/${locale}${link.href}`,
    })),
  };

  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${rootUrl}/#software`,
    name: brandProductName("workspace", locale),
    applicationCategory: "ProjectManagement",
    operatingSystem: "Web",
    url: workspaceUrl,
    image: logoUrl,
    inLanguage: langCode,
    description,
    keywords,
    offers: {
      "@type": "Offer",
      price: "6.99",
      priceCurrency: "USD",
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
        name: isArabic ? "الرئيسية" : locale === "fr" ? "Accueil" : "Home",
        item: url,
      },
    ],
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <JsonLd data={siteNavigation} />
      <JsonLd data={app} />
      <JsonLd data={breadcrumbs} />
    </>
  );
}

export function MarketingPageJsonLd({
  description,
  locale,
  path,
  title,
}: {
  description: string;
  locale: Locale;
  path: string;
  title: string;
}) {
  const langCode = locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en";
  const isArabic = locale === "ar";
  const cleanPath = path.replace(/^\/+/u, "");
  const pageUrl = `${rootUrl}/${locale}${cleanPath ? `/${cleanPath}` : ""}`;
  const homeUrl = `${rootUrl}/${locale}`;

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: langCode,
    isPartOf: { "@id": `${rootUrl}/#website` },
    publisher: { "@id": `${rootUrl}/#organization` },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isArabic ? "الرئيسية" : locale === "fr" ? "Accueil" : "Home",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={webPage} />
      <JsonLd data={breadcrumbs} />
    </>
  );
}
