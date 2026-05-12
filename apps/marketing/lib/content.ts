import { Blocks, Building2, Code2, ShieldCheck, Workflow } from "lucide-react";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export const productUrls = {
  workspace: process.env.NEXT_PUBLIC_WORKSPACE_URL ?? "https://app.anan.sa",
  partners: process.env.NEXT_PUBLIC_PARTNERS_URL ?? "https://partners.anan.sa"
};

export const productIcons = {
  workspace: Building2,
  partners: Code2
};

export const content = {
  en: {
    nav: {
      brand: "Anan",
      products: "Products",
      privacy: "Privacy",
      terms: "Terms",
      workspace: "Open Workspace",
      partners: "Partner Portal",
      language: "العربية"
    },
    home: {
      eyebrow: "Anan Real Estate Platform",
      title: "One operating layer for real estate teams and trusted integrations.",
      description:
        "Anan brings workspace operations and partner authorization into one clear product family for brokerages, developers, and software teams.",
      primaryCta: "Open Workspace",
      secondaryCta: "Explore Partners",
      proof: [
        { label: "Workspace", value: "Operations" },
        { label: "Partners", value: "Integrations" },
        { label: "Authorization", value: "Organization-level" }
      ],
      productsTitle: "Products under the Anan brand",
      productsDescription:
        "The public catalog focuses on products customers and developers can use directly.",
      principlesTitle: "Built around clear authorization",
      principles: [
        {
          title: "Workspace-first data",
          description: "Organizations manage people, properties, clients, projects, and day-to-day work from the main workspace.",
          icon: Workflow
        },
        {
          title: "Partner access by consent",
          description: "Approved partners connect through OAuth and scoped APIs instead of direct database access.",
          icon: ShieldCheck
        },
        {
          title: "One brand system",
          description: "Public pages, product surfaces, and developer flows share one Anan identity and policy layer.",
          icon: Blocks
        }
      ]
    },
    products: [
      {
        id: "workspace",
        name: "Anan Workspace",
        status: "Main product",
        href: productUrls.workspace,
        cta: "Open Workspace",
        description: "The operating system for real estate organizations to manage clients, properties, teams, projects, and daily work.",
        bullets: ["Organization workspace", "Real estate workflows", "Client and property operations"]
      },
      {
        id: "partners",
        name: "Anan Partners",
        status: "Developer program",
        href: productUrls.partners,
        cta: "Open Partner Portal",
        description: "The developer portal for registering OAuth apps, requesting review, and connecting approved tools to Anan organizations.",
        bullets: ["OAuth app registration", "Admin review flow", "Scoped partner APIs"]
      }
    ],
    legal: {
      privacyTitle: "Privacy Policy",
      termsTitle: "Terms of Service",
      updated: "Last updated: May 12, 2026",
      intro:
        "These pages summarize how Anan handles public website, workspace, and partner-program information. They should be reviewed by counsel before production use.",
      privacy: [
        {
          title: "Information we collect",
          body: "We collect information you provide directly, including account details, organization details, contact information, and documentation submitted during onboarding or partner review."
        },
        {
          title: "How information is used",
          body: "Information is used to operate Anan products, verify organizations, provide workspace features, review partner apps, support integrations, and maintain security and compliance records."
        },
        {
          title: "Data sharing",
          body: "Anan shares data with connected services only when an organization authorizes that access or when required to operate the requested product workflow. We do not sell personal data."
        },
        {
          title: "Security and retention",
          body: "Anan uses access controls, encrypted transport, audit records, and scoped authorization. Data is retained while accounts, organizations, or required compliance records remain active."
        }
      ],
      terms: [
        {
          title: "Acceptance",
          body: "By using Anan products, you agree to these terms. If you use Anan on behalf of an organization, you confirm that you have authority to bind that organization."
        },
        {
          title: "Product use",
          body: "Anan provides real estate workspace tools and partner authorization flows. Users are responsible for accurate information, lawful use, and protecting their account credentials."
        },
        {
          title: "Partner integrations",
          body: "Partner apps must use approved OAuth flows, scoped APIs, and secure token handling. Anan may reject, suspend, or revoke integrations that misuse data or violate review requirements."
        },
        {
          title: "Limitations",
          body: "Anan products are provided without warranties beyond those required by law. Anan is not liable for indirect or consequential damages arising from use of the platform."
        }
      ]
    }
  },
  ar: {
    nav: {
      brand: "أنان",
      products: "المنتجات",
      privacy: "الخصوصية",
      terms: "الشروط",
      workspace: "فتح مساحة العمل",
      partners: "بوابة الشركاء",
      language: "English"
    },
    home: {
      eyebrow: "منصة أنان العقارية",
      title: "طبقة تشغيل واحدة لفرق العقار والتكاملات الموثوقة.",
      description:
        "تجمع أنان بين تشغيل مساحة العمل وتفويض الشركاء ضمن عائلة منتجات واضحة للوسطاء والمطورين وفرق البرمجيات.",
      primaryCta: "فتح مساحة العمل",
      secondaryCta: "استكشاف الشركاء",
      proof: [
        { label: "مساحة العمل", value: "التشغيل" },
        { label: "الشركاء", value: "التكاملات" },
        { label: "التفويض", value: "على مستوى المؤسسة" }
      ],
      productsTitle: "منتجات تحت علامة أنان",
      productsDescription: "يعرض الكتالوج العام المنتجات التي يستخدمها العملاء والمطورون مباشرة.",
      principlesTitle: "مبنية حول تفويض واضح",
      principles: [
        {
          title: "البيانات تبدأ من مساحة العمل",
          description: "تدير المؤسسات الأشخاص والعقارات والعملاء والمشاريع والعمل اليومي من مساحة العمل الرئيسية.",
          icon: Workflow
        },
        {
          title: "وصول الشركاء بالموافقة",
          description: "يتصل الشركاء المعتمدون عبر OAuth وواجهات API محددة الصلاحيات بدلا من الوصول المباشر لقاعدة البيانات.",
          icon: ShieldCheck
        },
        {
          title: "نظام علامة واحد",
          description: "تتشارك الصفحات العامة وتجارب المنتج وتدفقات المطورين هوية أنان وطبقة السياسات نفسها.",
          icon: Blocks
        }
      ]
    },
    products: [
      {
        id: "workspace",
        name: "مساحة عمل أنان",
        status: "المنتج الرئيسي",
        href: productUrls.workspace,
        cta: "فتح مساحة العمل",
        description: "نظام تشغيل للمؤسسات العقارية لإدارة العملاء والعقارات والفرق والمشاريع والعمل اليومي.",
        bullets: ["مساحة عمل للمؤسسة", "تدفقات عمل عقارية", "تشغيل العملاء والعقارات"]
      },
      {
        id: "partners",
        name: "شركاء أنان",
        status: "برنامج المطورين",
        href: productUrls.partners,
        cta: "فتح بوابة الشركاء",
        description: "بوابة المطورين لتسجيل تطبيقات OAuth وطلب المراجعة وربط الأدوات المعتمدة بمؤسسات أنان.",
        bullets: ["تسجيل تطبيقات OAuth", "تدفق مراجعة إداري", "واجهات شريكة محددة الصلاحيات"]
      }
    ],
    legal: {
      privacyTitle: "سياسة الخصوصية",
      termsTitle: "شروط الخدمة",
      updated: "آخر تحديث: 12 مايو 2026",
      intro:
        "تلخص هذه الصفحات كيفية تعامل أنان مع معلومات الموقع العام ومساحة العمل وبرنامج الشركاء. يجب مراجعتها قانونيا قبل الاستخدام الإنتاجي.",
      privacy: [
        {
          title: "المعلومات التي نجمعها",
          body: "نجمع المعلومات التي تقدمها مباشرة، بما في ذلك تفاصيل الحساب والمؤسسة ومعلومات التواصل والمستندات المقدمة أثناء الانضمام أو مراجعة الشركاء."
        },
        {
          title: "كيفية استخدام المعلومات",
          body: "تستخدم المعلومات لتشغيل منتجات أنان، والتحقق من المؤسسات، وتوفير ميزات مساحة العمل، ومراجعة تطبيقات الشركاء، ودعم التكاملات، وحفظ سجلات الأمان والامتثال."
        },
        {
          title: "مشاركة البيانات",
          body: "تشارك أنان البيانات مع الخدمات المتصلة فقط عندما تفوض المؤسسة هذا الوصول أو عندما يكون ذلك مطلوبا لتشغيل تدفق المنتج المطلوب. لا نبيع البيانات الشخصية."
        },
        {
          title: "الأمان والاحتفاظ",
          body: "تستخدم أنان ضوابط وصول ونقلا مشفرا وسجلات تدقيق وتفويضا محدد الصلاحيات. يتم الاحتفاظ بالبيانات ما دامت الحسابات أو المؤسسات أو سجلات الامتثال المطلوبة نشطة."
        }
      ],
      terms: [
        {
          title: "القبول",
          body: "باستخدام منتجات أنان، فإنك توافق على هذه الشروط. إذا كنت تستخدم أنان نيابة عن مؤسسة، فأنت تؤكد أن لديك صلاحية إلزام تلك المؤسسة."
        },
        {
          title: "استخدام المنتج",
          body: "توفر أنان أدوات مساحة عمل عقارية وتدفقات تفويض للشركاء. يتحمل المستخدمون مسؤولية دقة المعلومات والاستخدام النظامي وحماية بيانات الدخول."
        },
        {
          title: "تكاملات الشركاء",
          body: "يجب أن تستخدم تطبيقات الشركاء تدفقات OAuth المعتمدة وواجهات API محددة الصلاحيات والتعامل الآمن مع الرموز. قد ترفض أنان أو تعلق أو تلغي التكاملات التي تسيء استخدام البيانات أو تخالف متطلبات المراجعة."
        },
        {
          title: "الحدود",
          body: "تقدم منتجات أنان دون ضمانات تتجاوز ما يتطلبه القانون. لا تتحمل أنان مسؤولية الأضرار غير المباشرة أو التبعية الناتجة عن استخدام المنصة."
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
