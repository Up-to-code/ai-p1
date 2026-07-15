import type { Metadata } from "next";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";
import { type Locale, type MarketingSeoEntry } from "@/lib/content";

const siteUrl = "https://www.qentrah.com";

type PageMeta = {
  title: string;
  titleTemplate?: string;
  description: string;
  ogDescription?: string;
  keywords?: string[];
};

const en: Record<string, PageMeta> = {
  home: {
    title: "Qentrah: The Connected Workspace for Teams and AI",
    description:
      "Qentrah is a connected workspace for organizing spaces, projects, tasks, documents, calendars, communication, and scoped AI agents in one operating context.",
    keywords: [
      "connected workspace",
      "team work management",
      "AI workspace",
      "project and task management",
      "team spaces",
      "scoped AI agents",
      "Qentrah",
    ],
  },
  pricing: {
    title: "Pricing — Qentrah",
    description:
      "Simple, transparent pricing for small teams and agencies. Start with what you need and scale as you grow. No hidden fees, no enterprise upsells.",
    keywords: ["Qentrah pricing", "agency software pricing", "AI project management cost"],
  },
  about: {
    title: "About — Qentrah",
    description:
      "Qentrah is building the future of work for small teams. We believe humans should lead and AI should do the boring work. One intelligent workspace for projects, clients, and collaboration.",
    keywords: ["about Qentrah", "AI project management company", "team productivity platform"],
  },
  blog: {
    title: "Blog — Qentrah",
    description:
      "Insights on AI-first project management, small agency operations, team productivity, and the future of work. Written for builders, makers, and team leads.",
    keywords: ["project management blog", "agency productivity", "AI team tools"],
  },
  contact: {
    title: "Contact — Qentrah",
    description:
      "Get in touch with the Qentrah team. Whether you have questions about AI project management, need help getting started, or want to share feedback — we'd love to hear from you.",
    keywords: ["contact Qentrah", "project management support", "AI workspace help"],
  },
  dashboard: {
    title: "Dashboard — Qentrah",
    description:
      "Your Qentrah workspace dashboard. Get a unified view of your projects, clients, tasks, and team activity in one AI-powered screen.",
  },
  docs: {
    title: "Docs — Qentrah",
    description:
      "Qentrah documentation and guides. Learn how to set up your AI-first workspace, manage projects, collaborate with your team, and automate busywork.",
  },
  partners: {
    title: "Partners — Qentrah",
    description:
      "Become a Qentrah partner. Integrate your app or service with the AI-first Work OS built for small teams and agencies.",
  },
  billing: {
    title: "Billing — Qentrah",
    description:
      "Manage your Qentrah subscription and billing. View plans, invoices, and payment details for your AI-powered project management workspace.",
    keywords: ["Qentrah billing", "manage subscription", "agency software billing"],
  },
  legal: {
    title: "Legal Notice — Qentrah",
    description:
      "Legal information and regulatory compliance for Qentrah — the AI-first Work OS for small teams and agencies.",
  },
  privacy: {
    title: "Privacy Policy — Qentrah",
    description:
      "Privacy Policy for Qentrah — how we collect, use, disclose, and protect your personal information when you use our AI-first project management platform.",
  },
  terms: {
    title: "Terms of Service — Qentrah",
    description:
      "Terms of Service for Qentrah — acceptance of terms, platform description, account responsibilities, and guidelines for using our AI-first project management software.",
  },
};

const ar: Record<string, PageMeta> = {
  home: {
    title: "كانترا: مساحة العمل المترابطة للفرق والذكاء الاصطناعي",
    description:
      "كانترا مساحة عمل مترابطة لتنظيم المساحات والمشاريع والمهام والمستندات والتقويم والتواصل ووكلاء الذكاء محددي النطاق ضمن سياق تشغيل واحد.",
    keywords: [
      "مساحة عمل مترابطة",
      "إدارة عمل الفرق",
      "مساحة عمل بالذكاء الاصطناعي",
      "إدارة المشاريع والمهام",
      "مساحات الفرق",
      "كانترا",
    ],
  },
  pricing: {
    title: "التسعير — كانترا",
    description:
      "تسعير بسيط وشفاف للفرق الصغيرة والوكالات. ابدأ بما تحتاجه ونمو مع تطورك. لا رسوم خفية ولا عروض مؤسسات معقدة.",
    keywords: ["تسعير كانترا", "أسعار برنامج إدارة الوكالات", "تكلفة إدارة المشاريع الذكية"],
  },
  about: {
    title: "عن كانترا — Qentrah",
    description:
      "كانترا تبني مستقبل العمل للفرق الصغيرة. نؤمن أن الإنسان يجب أن يقود والذكاء الاصطناعي يقوم بالأعمال الروتينية. مساحة عمل ذكية واحدة للمشاريع والعملاء والتعاون.",
    keywords: ["عن كانترا", "شركة إدارة مشاريع ذكية", "منصة إنتاجية للفرق"],
  },
  blog: {
    title: "المدونة — كانترا",
    description:
      "أحدث المقالات والأفكار حول إدارة المشاريع بالذكاء الاصطناعي، تشغيل الوكالات الصغيرة، إنتاجية الفرق، ومستقبل العمل.",
    keywords: ["مدونة إدارة مشاريع", "إنتاجية الوكالات", "أدوات الفرق الذكية"],
  },
  contact: {
    title: "اتصل بنا — كانترا",
    description:
      "تواصل مع فريق كانترا. سواء كان لديك أسئلة عن إدارة المشاريع الذكية، أو تحتاج مساعدة في البدء، أو تريد مشاركة ملاحظاتك — يسعدنا سماعك.",
    keywords: ["اتصل بكانترا", "دعم إدارة المشاريع", "مساعدة مساحة العمل الذكية"],
  },
  dashboard: {
    title: "لوحة التحكم — كانترا",
    description:
      "لوحة تحكم كانترا. عرض موحد لمشاريعك وعملائك ومهامك ونشاط فريقك في شاشة ذكية واحدة.",
  },
  docs: {
    title: "التوثيق — كانترا",
    description:
      "توثيق وأدلة كانترا. تعلم كيفية إعداد مساحة العمل الذكية، إدارة المشاريع، التعاون مع فريقك، وأتمتة المهام الروتينية.",
  },
  partners: {
    title: "الشركاء — كانترا",
    description:
      "كن شريكاً لكانترا. ادمج تطبيقك أو خدمتك مع منصة التشغيل الذكية المصممة للفرق الصغيرة والوكالات.",
  },
  billing: {
    title: "الفواتير — كانترا",
    description:
      "إدارة اشتراك كانترا والفواتير. عرض الخطط والفواتير وتفاصيل الدفع لمساحة عمل إدارة المشاريع الذكية.",
    keywords: ["فواتير كانترا", "إدارة الاشتراك", "فوترة برنامج الوكالات"],
  },
  legal: {
    title: "إشعار قانوني — كانترا",
    description:
      "المعلومات القانونية والامتثال التنظيمي لمنصة كانترا — منصة التشغيل الذكية للفرق الصغيرة والوكالات.",
  },
  privacy: {
    title: "سياسة الخصوصية — كانترا",
    description:
      "سياسة الخصوصية لمنصة كانترا — كيف نجمع البيانات الشخصية ونستخدمها ونحميها عند استخدامك لمنصة إدارة المشاريع الذكية.",
  },
  terms: {
    title: "شروط الخدمة — كانترا",
    description:
      "شروط الخدمة لمنصة كانترا — قبول الشروط، وصف المنصة، مسؤوليات الحساب، وإرشادات استخدام برنامج إدارة المشاريع الذكي.",
  },
};

const fr: Record<string, PageMeta> = {
  home: {
    title: "Qentrah : L’espace connecté pour les équipes et l’IA",
    description:
      "Qentrah est un espace connecté pour organiser équipes, espaces, projets, tâches, documents, calendriers, communication et agents IA cadrés dans un même contexte.",
    keywords: [
      "espace de travail connecté",
      "gestion du travail d’équipe",
      "espace IA",
      "gestion projets et tâches",
      "espaces d’équipe",
      "agents IA cadrés",
      "Qentrah",
    ],
  },
  pricing: {
    title: "Tarifs — Qentrah",
    description:
      "Des tarifs simples et transparents pour les petites équipes et les agences. Commencez avec l'essentiel et évoluez à votre rythme. Sans frais cachés ni ventes aux entreprises.",
    keywords: ["tarifs Qentrah", "prix logiciel agence", "coût gestion projet IA"],
  },
  about: {
    title: "À propos — Qentrah",
    description:
      "Qentrah construit le futur du travail pour les petites équipes. Nous croyons que l'humain doit diriger et l'IA faire le travail ennuyeux. Un espace de travail intelligent pour les projets, les clients et la collaboration.",
    keywords: ["à propos Qentrah", "entreprise gestion projet IA", "plateforme productivité équipe"],
  },
  blog: {
    title: "Blog — Qentrah",
    description:
      "Articles sur la gestion de projet pilotée par l'IA, les opérations des petites agences, la productivité des équipes et l'avenir du travail.",
    keywords: ["blog gestion projet", "productivité agence", "outils équipe IA"],
  },
  contact: {
    title: "Contact — Qentrah",
    description:
      "Contactez l'équipe Qentrah. Que vous ayez des questions sur la gestion de projet IA, besoin d'aide pour démarrer ou envie de partager vos commentaires — nous serions ravis de vous entendre.",
    keywords: ["contacter Qentrah", "support gestion projet", "aide espace travail IA"],
  },
  dashboard: {
    title: "Tableau de bord — Qentrah",
    description:
      "Votre tableau de bord Qentrah. Une vue unifiée de vos projets, clients, tâches et activités d'équipe sur un seul écran piloté par l'IA.",
  },
  docs: {
    title: "Documentation — Qentrah",
    description:
      "Documentation et guides Qentrah. Apprenez à configurer votre espace de travail IA, gérer des projets, collaborer avec votre équipe et automatiser les tâches répétitives.",
  },
  partners: {
    title: "Partenaires — Qentrah",
    description:
      "Devenez partenaire Qentrah. Intégrez votre application ou service au Work OS piloté par l'IA conçu pour les petites équipes et les agences.",
  },
  billing: {
    title: "Facturation — Qentrah",
    description:
      "Gérez votre abonnement et votre facturation Qentrah. Consultez les forfaits, factures et détails de paiement de votre espace de travail de gestion de projet IA.",
    keywords: ["facturation Qentrah", "gérer abonnement", "facturation logiciel agence"],
  },
  legal: {
    title: "Mentions légales — Qentrah",
    description:
      "Informations légales et conformité réglementaire pour Qentrah — le Work OS piloté par l'IA pour les petites équipes et les agences.",
  },
  privacy: {
    title: "Politique de confidentialité — Qentrah",
    description:
      "Politique de confidentialité de Qentrah — comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme de gestion de projet IA.",
  },
  terms: {
    title: "Conditions d'utilisation — Qentrah",
    description:
      "Conditions d'utilisation de Qentrah — acceptation des conditions, description de la plateforme, responsabilités du compte et directives d'utilisation de notre logiciel de gestion de projet IA.",
  },
};

const localeMap: Record<Locale, Record<string, PageMeta>> = { en, ar, fr };

export function pageMetadata(
  locale: Locale,
  page: string,
  cmsEntry?: MarketingSeoEntry,
): Metadata {
  const fallback = localeMap[locale]?.[page] ?? localeMap.en.home;
  const meta: PageMeta = cmsEntry
    ? { title: cmsEntry.title, description: cmsEntry.description, keywords: cmsEntry.keywords }
    : fallback;

  const isAr = locale === "ar";
  const isFr = locale === "fr";
  const brand = brandLabel(locale);
  const title = meta.title;
  const description = meta.description;

  return {
    title,
    description,
    keywords: meta.keywords,
    metadataBase: new URL(siteUrl),
    applicationName: brand,
    authors: [{ name: brand }],
    creator: brand,
    publisher: brand,
    openGraph: {
      type: "website",
      locale: isAr ? "ar_SA" : isFr ? "fr_FR" : "en_US",
      alternateLocale: isAr ? ["en_US", "fr_FR"] : isFr ? ["en_US", "ar_SA"] : ["ar_SA", "fr_FR"],
      siteName: brandProductName("workspace", isAr ? "ar" : "en"),
      title,
      description: meta.ogDescription ?? description,
      url: `/${locale}${page === "home" ? "" : `/${page}`}`,
      images: [
        {
          url: cmsEntry?.socialImage || "/logo.ico",
          width: 512,
          height: 512,
          alt: cmsEntry?.socialImageAlt || `${brand} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.ogDescription ?? description,
      images: [cmsEntry?.socialImage || "/logo.ico"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: `/${locale}${page === "home" ? "" : `/${page}`}`,
      languages: {
        "x-default": `/en${page === "home" ? "" : `/${page}`}`,
        en: `/en${page === "home" ? "" : `/${page}`}`,
        ar: `/ar${page === "home" ? "" : `/${page}`}`,
        fr: `/fr${page === "home" ? "" : `/${page}`}`,
      },
    },
  };
}
