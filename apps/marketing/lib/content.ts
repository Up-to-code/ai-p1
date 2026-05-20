import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export const productUrls = {
  workspace: process.env.NEXT_PUBLIC_WORKSPACE_URL?.trim() || brandDomainUrl("workspace"),
  partners: process.env.NEXT_PUBLIC_PARTNERS_URL?.trim() || brandDomainUrl("partners"),
  contact: `mailto:${brandIdentity.domains.email}`
};

const brandEn = brandLabel("en");
const brandAr = brandLabel("ar");
const workspaceEn = brandProductName("workspace", "en");
const workspaceAr = brandProductName("workspace", "ar");
const partnersEn = brandProductName("partners", "en");
const partnersAr = brandProductName("partners", "ar");

export const content = {
  en: {
    nav: {
      brand: brandEn,
      products: "Products",
      privacy: "Privacy",
      terms: "Terms",
      workspace: "Open Workspace",
      partners: "Partner Portal",
      language: "العربية"
    },
    home: {
      eyebrow: `${brandEn} product ecosystem`,
      title: "The real estate operating layer, on one domain.",
      description:
        `${brandEn} gives real estate teams one workspace for daily work and one trusted path for partner integrations around that work.`,
      primaryCta: "Open Workspace",
      secondaryCta: "Explore Partners",
      contactCta: `Talk to ${brandEn}`,
      atlasEyebrow: "Product atlas",
      atlasTitle: "Two public products. One operating system.",
      atlasDescription:
        "Workspace is where teams run clients, properties, projects, and follow-ups. Partners is where approved builders connect useful tools to that workspace.",
      flowEyebrow: "Operating flow",
      flowTitle: "From market signal to workspace action.",
      flowDescription:
        "The public story is simple: capture the signal, reconcile the operating context, authorize trusted tools, and move the team to the next action.",
      trustEyebrow: "Trust network",
      trustTitle: "Integrations connect through consent, not shortcuts.",
      trustDescription:
        `Partner products use OAuth, scoped access, and organization-level consent. ${brandEn} keeps workspace data behind clear permissions and approved API paths.`,
      futureEyebrow: "What this unlocks next",
      futureTitle: "The domain can grow without confusing the product.",
      futureDescription:
        `Future ${brandEn} offerings should feel like more rooms in the same operating layer, not separate brands fighting for attention.`,
      finalTitle: "Start with the workspace. Expand through trusted products.",
      finalDescription:
        `Open ${workspaceEn} for daily real estate work, or explore Partners if you are building approved tools for ${brandEn} teams.`
    },
    products: [
      {
        id: "workspace",
        name: workspaceEn,
        status: "Main product",
        href: productUrls.workspace,
        cta: "Open Workspace",
        description: "The operating product for real estate organizations to manage clients, properties, projects, teams, approvals, and daily work.",
        bullets: ["Today desk for real estate teams", "Clients, properties, projects, and calendar work", "Inventory readiness and operational approvals"]
      },
      {
        id: "partners",
        name: partnersEn,
        status: "Trusted integration path",
        href: productUrls.partners,
        cta: "Open Partner Portal",
        description: `The partner product for developers and software teams to register apps, request review, and connect approved tools to ${brandEn} workspaces.`,
        bullets: ["OAuth app registration", "Scoped organization consent", "Approved partner APIs"]
      }
    ] as const,
    flow: [
      {
        title: "Market signal",
        description: "Leads, inventory changes, media, pricing, and project updates enter the operating layer."
      },
      {
        title: "Workspace truth",
        description: "Teams reconcile clients, properties, projects, units, calendar work, and approvals in one place."
      },
      {
        title: "Trusted connection",
        description: "Approved partners connect through OAuth, scopes, and organization-level consent."
      },
      {
        title: "Next action",
        description: "Operators know what to follow up, approve, publish, prepare, or hand off next."
      }
    ] as const,
    trust: [
      {
        label: "OAuth authorization code with PKCE",
        description: "Operator approval stays explicit before data moves."
      },
      {
        label: "Organization-level consent",
        description: "Operator approval stays explicit before data moves."
      },
      {
        label: "Scoped partner APIs",
        description: "Every integration path is scoped, reviewed, and reversible."
      },
      {
        label: "Approved app lifecycle",
        description: "Every integration path is scoped, reviewed, and reversible."
      },
      {
        label: "No direct database access",
        description: "Every integration path is scoped, reviewed, and reversible."
      }
    ] as const,
    future: [
      "More workspace workflows",
      "More approved partner categories",
      "More market-facing operating views"
    ] as const,
    legal: {
      privacyTitle: "Privacy Policy",
      termsTitle: "Terms of Service",
      updated: "Last updated: May 12, 2026",
      intro:
        `These pages summarize how ${brandEn} handles public website, workspace, and partner-program information. They should be reviewed by counsel before production use.`,
      privacy: [
        {
          title: "Information we collect",
          body: "We collect information you provide directly, including account details, organization details, contact information, and documentation submitted during onboarding or partner review."
        },
        {
          title: "How information is used",
          body: `Information is used to operate ${brandEn} products, verify organizations, provide workspace features, review partner apps, support integrations, and maintain security and compliance records.`
        },
        {
          title: "Data sharing",
          body: `${brandEn} shares data with connected services only when an organization authorizes that access or when required to operate the requested product workflow. We do not sell personal data.`
        },
        {
          title: "Security and retention",
          body: `${brandEn} uses access controls, encrypted transport, audit records, and scoped authorization. Data is retained while accounts, organizations, or required compliance records remain active.`
        }
      ],
      terms: [
        {
          title: "Acceptance",
          body: `By using ${brandEn} products, you agree to these terms. If you use ${brandEn} on behalf of an organization, you confirm that you have authority to bind that organization.`
        },
        {
          title: "Product use",
          body: `${brandEn} provides real estate workspace tools and partner authorization flows. Users are responsible for accurate information, lawful use, and protecting their account credentials.`
        },
        {
          title: "Partner integrations",
          body: `Partner apps must use approved OAuth flows, scoped APIs, and secure token handling. ${brandEn} may reject, suspend, or revoke integrations that misuse data or violate review requirements.`
        },
        {
          title: "Limitations",
          body: `${brandEn} products are provided without warranties beyond those required by law. ${brandEn} is not liable for indirect or consequential damages arising from use of the platform.`
        }
      ]
    }
  },
  ar: {
    nav: {
      brand: brandAr,
      products: "المنتجات",
      privacy: "الخصوصية",
      terms: "الشروط",
      workspace: "فتح مساحة العمل",
      partners: "بوابة الشركاء",
      language: "English"
    },
    home: {
      eyebrow: `منظومة منتجات ${brandAr}`,
      title: "طبقة التشغيل العقاري على نطاق واحد.",
      description:
        `تمنح ${brandAr} فرق العقار مساحة عمل يومية ومسارا موثوقا للتكاملات حول هذا العمل.`,
      primaryCta: "فتح مساحة العمل",
      secondaryCta: "استكشاف الشركاء",
      contactCta: `تواصل مع ${brandAr}`,
      atlasEyebrow: "خريطة المنتجات",
      atlasTitle: "منتجان عامان. نظام تشغيل واحد.",
      atlasDescription:
        "مساحة العمل هي مكان تشغيل العملاء والعقارات والمشاريع والمتابعات. والشركاء هو مسار ربط الأدوات المعتمدة بهذه المساحة.",
      flowEyebrow: "سير التشغيل",
      flowTitle: "من إشارة السوق إلى إجراء داخل مساحة العمل.",
      flowDescription:
        "القصة العامة واضحة: التقط الإشارة، وحد سياق العمل، فوض الأدوات الموثوقة، ثم انقل الفريق إلى الخطوة التالية.",
      trustEyebrow: "شبكة الثقة",
      trustTitle: "التكاملات تتصل بالموافقة، لا بالاختصارات.",
      trustDescription:
        "تستخدم منتجات الشركاء OAuth وصلاحيات محددة وموافقة على مستوى المؤسسة. تبقى بيانات مساحة العمل خلف أذونات واضحة ومسارات API معتمدة.",
      futureEyebrow: "ما الذي يفتحه هذا لاحقا",
      futureTitle: "يمكن للنطاق أن ينمو بدون تشتيت المنتج.",
      futureDescription:
        `يجب أن تبدو عروض ${brandAr} المستقبلية كغرف إضافية داخل طبقة التشغيل نفسها، لا كعلامات منفصلة تتنافس على الانتباه.`,
      finalTitle: "ابدأ بمساحة العمل. وتوسع عبر منتجات موثوقة.",
      finalDescription:
        `افتح ${workspaceAr} لتشغيل العمل العقاري اليومي، أو استكشف الشركاء إذا كنت تبني أدوات معتمدة لفرق ${brandAr}.`
    },
    products: [
      {
        id: "workspace",
        name: workspaceAr,
        status: "المنتج الرئيسي",
        href: productUrls.workspace,
        cta: "فتح مساحة العمل",
        description: "منتج التشغيل للمؤسسات العقارية لإدارة العملاء والعقارات والمشاريع والفرق والموافقات والعمل اليومي.",
        bullets: ["مكتب اليوم لفرق العقار", "عملاء وعقارات ومشاريع وتقويم", "جاهزية المخزون والموافقات التشغيلية"]
      },
      {
        id: "partners",
        name: partnersAr,
        status: "مسار التكاملات الموثوقة",
        href: productUrls.partners,
        cta: "فتح بوابة الشركاء",
        description: `منتج الشركاء للمطورين وفرق البرمجيات لتسجيل التطبيقات وطلب المراجعة وربط الأدوات المعتمدة بمساحات عمل ${brandAr}.`,
        bullets: ["تسجيل تطبيقات OAuth", "موافقة مؤسسية محددة الصلاحيات", "واجهات API للشركاء المعتمدين"]
      }
    ] as const,
    flow: [
      {
        title: "إشارة السوق",
        description: "يدخل الطلب وتغيرات المخزون والوسائط والتسعير وتحديثات المشاريع إلى طبقة التشغيل."
      },
      {
        title: "حقيقة مساحة العمل",
        description: "يوحد الفريق العملاء والعقارات والمشاريع والوحدات والتقويم والموافقات في مكان واحد."
      },
      {
        title: "اتصال موثوق",
        description: "يتصل الشركاء المعتمدون عبر OAuth والصلاحيات والموافقة على مستوى المؤسسة."
      },
      {
        title: "الخطوة التالية",
        description: "يعرف المشغل ما يحتاج متابعة أو اعتمادا أو نشرا أو تحضيرا أو تسليما."
      }
    ] as const,
    trust: [
      {
        label: "OAuth مع PKCE",
        description: "تبقى موافقة المشغل واضحة قبل انتقال البيانات."
      },
      {
        label: "موافقة على مستوى المؤسسة",
        description: "تبقى موافقة المشغل واضحة قبل انتقال البيانات."
      },
      {
        label: "واجهات API محددة الصلاحيات",
        description: "كل مسار تكامل محدد الصلاحيات، ومراجع، وقابل للإلغاء."
      },
      {
        label: "دورة حياة للتطبيقات المعتمدة",
        description: "كل مسار تكامل محدد الصلاحيات، ومراجع، وقابل للإلغاء."
      },
      {
        label: "بدون وصول مباشر لقاعدة البيانات",
        description: "كل مسار تكامل محدد الصلاحيات، ومراجع، وقابل للإلغاء."
      }
    ] as const,
    future: [
      "تدفقات عمل أكثر داخل مساحة العمل",
      "فئات أكثر من الشركاء المعتمدين",
      "رؤى تشغيلية أكثر للسوق"
    ] as const,
    legal: {
      privacyTitle: "سياسة الخصوصية",
      termsTitle: "شروط الخدمة",
      updated: "آخر تحديث: 12 مايو 2026",
      intro:
        `تلخص هذه الصفحات كيفية تعامل ${brandAr} مع معلومات الموقع العام ومساحة العمل وبرنامج الشركاء. يجب مراجعتها قانونيا قبل الاستخدام الإنتاجي.`,
      privacy: [
        {
          title: "المعلومات التي نجمعها",
          body: "نجمع المعلومات التي تقدمها مباشرة، بما في ذلك تفاصيل الحساب والمؤسسة ومعلومات التواصل والمستندات المقدمة أثناء الانضمام أو مراجعة الشركاء."
        },
        {
          title: "كيفية استخدام المعلومات",
          body: `تستخدم المعلومات لتشغيل منتجات ${brandAr}، والتحقق من المؤسسات، وتوفير ميزات مساحة العمل، ومراجعة تطبيقات الشركاء، ودعم التكاملات، وحفظ سجلات الأمان والامتثال.`
        },
        {
          title: "مشاركة البيانات",
          body: `تشارك ${brandAr} البيانات مع الخدمات المتصلة فقط عندما تفوض المؤسسة هذا الوصول أو عندما يكون ذلك مطلوبا لتشغيل تدفق المنتج المطلوب. لا نبيع البيانات الشخصية.`
        },
        {
          title: "الأمان والاحتفاظ",
          body: `تستخدم ${brandAr} ضوابط وصول ونقلا مشفرا وسجلات تدقيق وتفويضا محدد الصلاحيات. يتم الاحتفاظ بالبيانات ما دامت الحسابات أو المؤسسات أو سجلات الامتثال المطلوبة نشطة.`
        }
      ],
      terms: [
        {
          title: "القبول",
          body: `باستخدام منتجات ${brandAr}، فإنك توافق على هذه الشروط. إذا كنت تستخدم ${brandAr} نيابة عن مؤسسة، فأنت تؤكد أن لديك صلاحية إلزام تلك المؤسسة.`
        },
        {
          title: "استخدام المنتج",
          body: `توفر ${brandAr} أدوات مساحة عمل عقارية وتدفقات تفويض للشركاء. يتحمل المستخدمون مسؤولية دقة المعلومات والاستخدام النظامي وحماية بيانات الدخول.`
        },
        {
          title: "تكاملات الشركاء",
          body: `يجب أن تستخدم تطبيقات الشركاء تدفقات OAuth المعتمدة وواجهات API محددة الصلاحيات والتعامل الآمن مع الرموز. قد ترفض ${brandAr} أو تعلق أو تلغي التكاملات التي تسيء استخدام البيانات أو تخالف متطلبات المراجعة.`
        },
        {
          title: "الحدود",
          body: `تقدم منتجات ${brandAr} دون ضمانات تتجاوز ما يتطلبه القانون. لا تتحمل ${brandAr} مسؤولية الأضرار غير المباشرة أو التبعية الناتجة عن استخدام المنصة.`
        }
      ]
    }
  }
} as const;

export function getContent(locale: Locale) {
  return content[locale];
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
