import { brandDomainUrl } from "@qentrah/brand-identity";

import type { Locale } from "@/lib/content";

export type PublicSeoLinkId = "home" | "pricing" | "docs" | "about";

type PublicSeoLink = {
  id: PublicSeoLinkId;
  href: string;
  externalUrl: string;
  navKey: PublicSeoLinkId;
  labels: Record<Locale, string>;
  descriptions: Record<Locale, string>;
};

const rootUrl = brandDomainUrl("root");

export const publicSeoLinks = [
  {
    id: "home",
    href: "/",
    externalUrl: rootUrl,
    navKey: "home",
    labels: {
      en: "Home",
      ar: "الرئيسية",
    },
    descriptions: {
      en: "Open the Qentrah public homepage.",
      ar: "افتح الصفحة الرئيسية العامة لكانترا.",
    },
  },
  {
    id: "pricing",
    href: "/#pricing",
    externalUrl: `${rootUrl}/#pricing`,
    navKey: "pricing",
    labels: {
      en: "Pricing",
      ar: "الأسعار",
    },
    descriptions: {
      en: "View Qentrah workspace pricing.",
      ar: "اطلع على أسعار مساحة عمل كانترا.",
    },
  },
  {
    id: "docs",
    href: "/docs",
    externalUrl: `${rootUrl}/docs`,
    navKey: "docs",
    labels: {
      en: "Docs",
      ar: "التوثيق",
    },
    descriptions: {
      en: "Read Qentrah public documentation.",
      ar: "اقرأ توثيق كانترا العام.",
    },
  },
  {
    id: "about",
    href: "/about",
    externalUrl: `${rootUrl}/about`,
    navKey: "about",
    labels: {
      en: "About us",
      ar: "من نحن",
    },
    descriptions: {
      en: "Learn about Qentrah and the team building it.",
      ar: "تعرّف على كانترا والفريق الذي يبنيها.",
    },
  },
] as const satisfies readonly PublicSeoLink[];

export const publicSeoPathIds = ["", "docs", "about"] as const;

export function findPublicSeoLink(id: PublicSeoLinkId) {
  return publicSeoLinks.find((link) => link.id === id);
}
