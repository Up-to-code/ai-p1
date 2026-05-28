import { brandDomainUrl, brandProductName } from "@qentrah/brand-identity";

import { productUrls, type Locale } from "@/lib/content";

export type PublicSeoLinkId = "workspace" | "partners" | "developers" | "brokers" | "contact";

type PublicSeoLink = {
  id: PublicSeoLinkId;
  href: string;
  externalUrl: string;
  navKey: "dashboard" | "partners" | "developers" | "brokers" | "contact";
  labels: Record<Locale, string>;
  descriptions: Record<Locale, string>;
};

const rootUrl = brandDomainUrl("root");

export const publicSeoLinks = [
  {
    id: "workspace",
    href: "/dashboard",
    externalUrl: productUrls.workspace,
    navKey: "dashboard",
    labels: {
      en: brandProductName("workspace", "en"),
      ar: brandProductName("workspace", "ar"),
    },
    descriptions: {
      en: "Enter the Qentrah Workspace for real estate projects, units, clients, approvals, and partner apps.",
      ar: "ادخل إلى مساحة العمل كانترا لإدارة المشاريع والوحدات والعملاء والموافقات وتطبيقات الشركاء.",
    },
  },
  {
    id: "partners",
    href: "/partners",
    externalUrl: productUrls.partners,
    navKey: "partners",
    labels: {
      en: brandProductName("partners", "en"),
      ar: brandProductName("partners", "ar"),
    },
    descriptions: {
      en: "Build and submit Qentrah partner apps that connect securely to organization workspace data.",
      ar: "ابنِ تطبيقات شركاء كانترا واربطها بأمان ببيانات مساحة عمل المؤسسات.",
    },
  },
  {
    id: "developers",
    href: "/developer",
    externalUrl: `${rootUrl}/developer`,
    navKey: "developers",
    labels: {
      en: "Developers",
      ar: "المطورون",
    },
    descriptions: {
      en: "See how real estate developers prepare projects, verify inventory, and coordinate brokers in Qentrah.",
      ar: "تعرّف على طريقة تجهيز المطورين للمشاريع والتحقق من المخزون وتنسيق الوسطاء في كانترا.",
    },
  },
  {
    id: "brokers",
    href: "/broker",
    externalUrl: `${rootUrl}/broker`,
    navKey: "brokers",
    labels: {
      en: "Brokers",
      ar: "الوسطاء",
    },
    descriptions: {
      en: "See how brokers organize follow-ups, viewings, client context, and verified inventory in Qentrah.",
      ar: "تعرّف على طريقة تنظيم الوسطاء للمتابعات والمعاينات وسياق العملاء والمخزون الموثق في كانترا.",
    },
  },
  {
    id: "contact",
    href: "/contact",
    externalUrl: `${rootUrl}/contact`,
    navKey: "contact",
    labels: {
      en: "Contact",
      ar: "التواصل",
    },
    descriptions: {
      en: "Contact Qentrah to map your real estate workspace, partner integration, or onboarding workflow.",
      ar: "تواصل مع كانترا لربط مساحة عملك العقارية أو تكاملات الشركاء أو مسار التفعيل.",
    },
  },
] as const satisfies readonly PublicSeoLink[];

export const publicSeoPathIds = ["", "dashboard", "partners", "developer", "broker", "contact"] as const;

export function findPublicSeoLink(id: PublicSeoLinkId) {
  return publicSeoLinks.find((link) => link.id === id);
}
