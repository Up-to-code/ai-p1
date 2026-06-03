import { brandProductName } from "@qentrah/brand-identity";

import { publicSeoLocale, workspacePublicMetadata } from "./public-metadata";

type PublicPageKey =
  | "home"
  | "about"
  | "broker"
  | "developer"
  | "contact"
  | "legal"
  | "privacy"
  | "terms"
  | "blog";

const publicPageSeo = {
  en: {
    home: {
      path: "/",
      title: "Qentrah Workspace | Saudi real estate operations",
      description: "Run Saudi real estate projects, units, clients, viewings, and partner access from one trusted workspace.",
    },
    about: {
      path: "/about",
      title: "About Qentrah Workspace",
      description: "Learn how Qentrah builds trusted real estate workspace software for developers, brokers, and operating teams.",
    },
    broker: {
      path: "/broker",
      title: "Broker workspace for live inventory and client follow-up",
      description: "Coordinate broker clients, viewings, follow-ups, and verified unit inventory in Qentrah Workspace.",
    },
    developer: {
      path: "/developer",
      title: "Developer workspace for projects, approvals, and inventory",
      description: "Prepare projects, approvals, inventory, and connected workflows for Saudi real estate development teams.",
    },
    contact: {
      path: "/contact",
      title: "Contact Qentrah",
      description: "Contact Qentrah to map your real estate workspace, integrations, and operating workflow.",
    },
    legal: {
      path: "/legal",
      title: "Legal Notice",
      description: "Read the legal notice for Qentrah Workspace and its Saudi real estate operating platform.",
    },
    privacy: {
      path: "/privacy",
      title: "Privacy Policy",
      description: "Read how Qentrah Workspace handles real estate workspace data, account data, and privacy requests.",
    },
    terms: {
      path: "/terms",
      title: "Terms of Service",
      description: "Read the terms that govern access to Qentrah Workspace and its real estate operating tools.",
    },
    blog: {
      path: "/blog",
      title: "Qentrah Blog",
      description: "Product notes and operating guides for real estate teams using Qentrah Workspace.",
    },
  },
  ar: {
    home: {
      path: "/",
      title: `${brandProductName("workspace", "ar")} | مساحة عمل عقارية سعودية`,
      description: "أدر المشاريع والوحدات والعملاء والمعاينات وصلاحيات الشركاء من مساحة عمل عقارية موثوقة.",
    },
    about: {
      path: "/about",
      title: `عن ${brandProductName("workspace", "ar")}`,
      description: "تعرّف على طريقة بناء كانترا لمساحة عمل عقارية موثوقة للمطورين والوسطاء وفرق التشغيل.",
    },
    broker: {
      path: "/broker",
      title: "مساحة عمل للوسطاء وإدارة العملاء والمخزون",
      description: "نسّق العملاء والمعاينات والمتابعات والمخزون العقاري الموثق من داخل كانترا.",
    },
    developer: {
      path: "/developer",
      title: "مساحة عمل للمطورين والمشاريع والموافقات",
      description: "جهّز المشاريع والموافقات والمخزون والتدفقات المتصلة لفرق التطوير العقاري في السعودية.",
    },
    contact: {
      path: "/contact",
      title: "تواصل مع كانترا",
      description: "تواصل مع كانترا لرسم مساحة عملك العقارية وتكاملاتك وتدفقك التشغيلي.",
    },
    legal: {
      path: "/legal",
      title: "الإشعار القانوني",
      description: "اطّلع على الإشعار القانوني الخاص بمساحة عمل كانترا ومنصتها التشغيلية العقارية.",
    },
    privacy: {
      path: "/privacy",
      title: "سياسة الخصوصية",
      description: "اطّلع على طريقة تعامل كانترا مع بيانات مساحة العمل العقارية وطلبات الخصوصية.",
    },
    terms: {
      path: "/terms",
      title: "شروط الخدمة",
      description: "اطّلع على الشروط التي تنظّم الوصول إلى مساحة عمل كانترا وأدواتها العقارية.",
    },
    blog: {
      path: "/blog",
      title: "مدونة كانترا",
      description: "ملاحظات منتج وأدلة تشغيلية للفرق العقارية التي تستخدم مساحة عمل كانترا.",
    },
  },
} satisfies Record<string, Record<PublicPageKey, { path: string; title: string; description: string }>>;

export function publicPageMetadata(locale: string, page: PublicPageKey) {
  const activeLocale = publicSeoLocale(locale);
  return workspacePublicMetadata({
    locale: activeLocale,
    ...publicPageSeo[activeLocale][page],
  });
}

