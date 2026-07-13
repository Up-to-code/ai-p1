import { brandDomainUrl } from "@qentrah/brand-identity";

import type { Locale } from "@/lib/content";

type PublicSeoLinkId = "home" | "pricing" | "docs";

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
      fr: "Accueil",
    },
    descriptions: {
      en: "Open the Qentrah public homepage.",
      ar: "افتح الصفحة الرئيسية العامة لكانترا.",
      fr: "Ouvrir la page d'accueil publique de Qentrah.",
    },
  },
  {
    id: "pricing",
    href: "/pricing",
    externalUrl: `${rootUrl}/pricing`,
    navKey: "pricing",
    labels: {
      en: "Pricing",
      ar: "الأسعار",
      fr: "Tarifs",
    },
    descriptions: {
      en: "View Qentrah workspace pricing.",
      ar: "اطلع على أسعار مساحة عمل كانترا.",
      fr: "Voir les tarifs de l'espace de travail Qentrah.",
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
      fr: "Documentation",
    },
    descriptions: {
      en: "Read Qentrah public documentation.",
      ar: "اقرأ توثيق كانترا العام.",
      fr: "Consulter la documentation publique de Qentrah.",
    },
  },
] as const satisfies readonly PublicSeoLink[];
