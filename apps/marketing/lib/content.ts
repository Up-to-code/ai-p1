import {
  brandDomainUrl,
  brandIdentity,
  brandLabel,
  brandProductName,
} from "@qentrah/brand-identity";

import workspaceAr from "../../workspace/messages/ar.json";
import workspaceEn from "../../workspace/messages/en.json";

export const locales = ["en", "ar", "fr"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isRtl(locale: Locale) {
  return locale === "ar";
}

export const productUrls = {
  workspace:
    process.env.NEXT_PUBLIC_WORKSPACE_URL?.trim() ||
    brandDomainUrl("workspace"),
  partners:
    process.env.NEXT_PUBLIC_PARTNERS_URL?.trim() || brandDomainUrl("partners"),
  contact: `mailto:${brandIdentity.domains.email}`,
};

export function getWorkspaceLanding(locale: Locale) {
  if (locale === "ar") return workspaceAr.Landing;
  return workspaceEn.Landing;
}

export function getMarketingMessages(locale: Locale) {
  if (locale === "ar") return workspaceAr;
  return workspaceEn;
}

const workspaceEnName = brandProductName("workspace", "en");
const workspaceArName = brandProductName("workspace", "ar");
const partnersEnName = brandProductName("partners", "en");
const partnersArName = brandProductName("partners", "ar");

export type LegalBlockBody = string | Array<string | string[]>;
type LegalBlockCopy = { title: string; body: LegalBlockBody };

function block(title: string, body: LegalBlockBody): LegalBlockCopy {
  return { title, body };
}

export type MarketingHeroContent = {
  eyebrow: string;
  tagline: string;
  description: string;
  cta: string;
  secondary: string;
  words: string[];
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  metric: string;
};

export type MarketingNavContent = {
  brand: string;
  products: string;
  privacy: string;
  terms: string;
  legal: string;
  workspace: string;
  partners: string;
  language: string;
  signIn: string;
  openMenu: string;
  closeMenu: string;
};

export type MarketingFooterContent = {
  tagline: string;
  description: string;
  platform: string;
  workspace: string;
  legal: string;
  dashboard: string;
  contact: string;
  privacy: string;
  terms: string;
  copyright: string;
};

const marketingHero: Record<Locale, MarketingHeroContent> = {
  en: {
    eyebrow: "ONE WORKSPACE. FULL CONTEXT.",
    tagline: "Run your agency",
    description:
      "Plan work, manage clients, create documents, and put AI to work — without losing the context between them.",
    cta: "Start free",
    secondary: "Explore pricing",
    words: ["together", "clearly", "with AI", "from one place"],
  },
  ar: {
    eyebrow: "مساحة واحدة. سياق كامل.",
    tagline: "أدر أعمالك",
    description:
      "خطط للعمل، وأدر العملاء، وأنشئ المستندات، واستفد من الذكاء الاصطناعي من دون أن تفقد السياق بينها.",
    cta: "ابدأ مجاناً",
    secondary: "اطّلع على الأسعار",
    words: ["معاً", "بوضوح", "بذكاء", "من مكان واحد"],
  },
  fr: {
    eyebrow: "UN ESPACE. TOUT LE CONTEXTE.",
    tagline: "Pilotez votre agence",
    description:
      "Planifiez le travail, gérez vos clients, créez vos documents et mettez l’IA à contribution sans perdre le contexte.",
    cta: "Commencer gratuitement",
    secondary: "Voir les tarifs",
    words: ["ensemble", "clairement", "avec l’IA", "au même endroit"],
  },
};

const testimonials: Record<Locale, Testimonial[]> = {
  en: [
    {
      quote:
        "Qentrah transformed how we manage our agency. Projects that used to take days now ship in hours — with full context across every team.",
      author: "Sarah Chen",
      role: "CTO",
      company: "Meridian Labs",
      metric: "10x faster delivery",
    },
    {
      quote:
        "The AI agents understand our workflow better than any tool we've used. It's like having an extra team member who knows everything.",
      author: "Marcus Webb",
      role: "Engineering Lead",
      company: "Flux Systems",
      metric: "40% more output",
    },
    {
      quote:
        "Finally, a platform where projects, clients, and communication live together. Zero context switching since we switched.",
      author: "Elena Rodriguez",
      role: "VP Engineering",
      company: "Beacon AI",
      metric: "99.9% context retention",
    },
    {
      quote:
        "The MCP protocol lets us connect everything. We automated our entire client intake process in a single afternoon.",
      author: "James Liu",
      role: "Founder",
      company: "Prism Analytics",
      metric: "50+ integrations live",
    },
  ],
  ar: [
    {
      quote:
        "كانترا غيرت طريقة إدارة وكالتنا. المشاريع التي كانت تستغرق أياماً تُنجز الآن في ساعات — بسياق كامل عبر كل فريق.",
      author: "سارة الشمراني",
      role: "مديرة التقنية",
      company: "ميريديان لابز",
      metric: "تسليم أسرع ١٠ مرات",
    },
    {
      quote:
        "الوكلاء الذكيون يفهمون سير عملنا أفضل من أي أداة استخدمناها. إنه مثل وجود عضو إضافي في الفريق يعرف كل شيء.",
      author: "محمود الحارثي",
      role: "قائد هندسي",
      company: "فلكس سيستمز",
      metric: "إنتاجية أكثر ٤٠٪",
    },
    {
      quote:
        "أخيراً، منصة تجمع المشاريع والعملاء والتواصل في مكان واحد. لا مزيد من التنقل بين الأدوات منذ أن تحولنا.",
      author: "لينا الغامدي",
      role: "نائبة رئيس الهندسة",
      company: "بيكن إي آي",
      metric: "٩٩.٩٪ احتفاظ بالسياق",
    },
    {
      quote:
        "بروتوكول MCP يتيح لنا ربط كل شيء. أتمتنا عملية استقبال العملاء بالكامل في بعد ظهر واحد.",
      author: "جمال الزهراني",
      role: "مؤسس",
      company: "بريزم أناليتيكس",
      metric: "أكثر من ٥٠ تكامل فعال",
    },
  ],
  fr: [
    {
      quote:
        "Qentrah a transformé notre façon de gérer notre agence. Les projets qui prenaient des jours sont maintenant livrés en heures — avec un contexte complet à travers chaque équipe.",
      author: "Sarah Chen",
      role: "CTO",
      company: "Meridian Labs",
      metric: "Livraison 10x plus rapide",
    },
    {
      quote:
        "Les agents IA comprennent notre flux de travail mieux que n'importe quel outil que nous avons utilisé. C'est comme avoir un membre d'équipe supplémentaire qui sait tout.",
      author: "Marcus Webb",
      role: "Responsable Ingénierie",
      company: "Flux Systems",
      metric: "40% de rendement en plus",
    },
    {
      quote:
        "Enfin, une plateforme où projets, clients et communication coexistent. Zéro changement de contexte depuis que nous avons adopté Qentrah.",
      author: "Elena Rodriguez",
      role: "VP Ingénierie",
      company: "Beacon AI",
      metric: "99,9% de rétention de contexte",
    },
    {
      quote:
        "Le protocole MCP nous permet de tout connecter. Nous avons automatisé l'ensemble de notre processus d'accueil des clients en un après-midi.",
      author: "James Liu",
      role: "Fondateur",
      company: "Prism Analytics",
      metric: "50+ intégrations actives",
    },
  ],
};

const marketingNav: Record<Locale, MarketingNavContent> = {
  en: {
    brand: brandLabel("en"),
    products: "Products",
    privacy: "Privacy",
    terms: "Terms",
    legal: "Legal",
    workspace: "Dashboard",
    partners: partnersEnName,
    language: "العربية",
    signIn: "Sign in",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  ar: {
    brand: brandLabel("ar"),
    products: "المنتجات",
    privacy: "الخصوصية",
    terms: "الشروط",
    legal: "قانوني",
    workspace: "لوحة التحكم",
    partners: partnersArName,
    language: "English",
    signIn: "تسجيل الدخول",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },
  fr: {
    brand: brandLabel("en"),
    products: "Produits",
    privacy: "Confidentialité",
    terms: "Conditions",
    legal: "Mentions légales",
    workspace: "Tableau de bord",
    partners: "Partenaires",
    language: "Français",
    signIn: "Connexion",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
};

const marketingFooter: Record<Locale, MarketingFooterContent> = {
  en: {
    tagline: "AI-FIRST WORK OS",
    description:
      "One intelligent workspace for projects, clients, AI agents, and your entire team.",
    platform: "Platform",
    workspace: "Workspace",
    legal: "Legal",
    dashboard: "Dashboard",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    copyright: `© ${new Date().getFullYear()} Qentrah. All rights reserved.`,
  },
  ar: {
    tagline: "منصة تشغيل ذكية",
    description:
      "مساحة عمل ذكية واحدة للمشاريع والعملاء والوكلاء الذكيين وفريقك بالكامل.",
    platform: "المنصة",
    workspace: "مساحة العمل",
    legal: "قانوني",
    dashboard: "لوحة التحكم",
    contact: "اتصل بنا",
    privacy: "الخصوصية",
    terms: "الشروط",
    copyright: `© ${new Date().getFullYear()} كانترا. جميع الحقوق محفوظة.`,
  },
  fr: {
    tagline: "WORK OS PILOTÉ PAR L'IA",
    description:
      "Un espace de travail intelligent pour vos projets, clients, agents IA et toute votre équipe.",
    platform: "Plateforme",
    workspace: "Espace de travail",
    legal: "Mentions légales",
    dashboard: "Tableau de bord",
    contact: "Contact",
    privacy: "Confidentialité",
    terms: "Conditions",
    copyright: `© ${new Date().getFullYear()} Qentrah. Tous droits réservés.`,
  },
};

const workspaceLegal = {
  en: {
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Service",
    legalTitle: "Legal Notice",
    privacyUpdated: "Last updated: May 4, 2026",
    termsUpdated: "Last updated: May 4, 2026",
    legalUpdated: "Last updated: May 4, 2026",
    privacyContact: "If you have privacy questions, contact us at",
    privacy: [
      block(
        "1. Introduction",
        "Welcome to Qentrah. Your privacy and data security are critical to us. This Privacy Policy explains how Qentrah collects, uses, and protects your information when you use our AI-powered workspace and client operations platform.",
      ),
      block(
        "2. Data Collection and Usage",
        "We collect information necessary to provide and improve the Qentrah service, including account details, workspace data (Clients, Opportunities, Projects, Tasks), and usage metrics. Your data is used exclusively to operate the platform, provide AI-assisted insights within your workspace, and enhance your user experience.",
      ),
      block(
        "3. AI and Data Processing",
        "Qentrah utilizes AI to operate your workspace. We ensure that data processed by our AI models is handled securely and is used solely to provide features to your specific workspace. We do not use your proprietary client data to train public models.",
      ),
      block(
        "4. Data Security",
        "We implement industry-standard security measures to protect your client data and workspace information from unauthorized access, alteration, or disclosure.",
      ),
      block(
        "5. Cookies and Tracking",
        "Qentrah uses cookies and similar technologies to maintain user sessions, remember preferences, and analyze platform performance. You can control cookie preferences through your browser settings.",
      ),
      block(
        "6. Your Rights",
        "You have the right to access, correct, or delete your personal and workspace data at any time. If you wish to exercise these rights or have questions about how Qentrah handles your data, please contact me directly at hello@qentrah.com.",
      ),
      block(
        "7. Changes to This Policy",
        "As Qentrah evolves, this Privacy Policy may be updated. We will notify you of any significant changes via email or an in-app notification.",
      ),
    ],
    terms: [
      block(
        "1. Acceptance of Terms",
        "By accessing or using the platform, you agree to these Terms of Service. If you use the platform for an organization, you confirm that you are authorized to bind that organization.",
      ),
      block(
        "2. Platform Description",
        "The platform provides an AI-powered workspace, client operations, and project management tools for authorized agencies and professional service teams.",
      ),
      block(
        "3. Account Responsibilities",
        "You are responsible for account credentials, accurate onboarding information, and lawful use of the platform. Fraudulent or misleading information may result in suspension or termination.",
      ),
      block(
        "4. Data Accuracy",
        "Organizations are responsible for the accuracy of project, task, client, and operational data submitted to the platform.",
      ),
      block(
        "5. Integrations",
        "Connected tools and partner integrations are subject to approval, scoped access, and security requirements. We may suspend integrations that misuse data or violate platform rules.",
      ),
      block(
        "6. Limitation of Liability",
        "The platform is provided as is to the extent permitted by law. We are not liable for indirect or consequential damages arising from use of the platform.",
      ),
      block(
        "7. Governing Law",
        "These Terms are governed by the laws of the jurisdiction in which the organization operates. Disputes are resolved by the competent courts of the relevant jurisdiction.",
      ),
    ],
    legal: [
      block("Company Information", [
        `${workspaceEnName} is operated by ${brandIdentity.legalName.en}.`,
        [
          "Headquarters: Operating region as registered",
          "Registration: As per applicable regulations",
        ],
      ]),
      block(
        "Regulatory Compliance",
        "The platform operates in accordance with applicable data protection and electronic service requirements.",
      ),
      block(
        "Intellectual Property",
        "All content, trademarks, logos, and intellectual property displayed on this platform are owned by the company or their respective owners. Unauthorized use is prohibited.",
      ),
      block(
        "Dispute Resolution",
        "Any disputes arising from the use of this platform are subject to the competent courts of the relevant jurisdiction.",
      ),
    ],
  },
  ar: {
    privacyTitle: "سياسة الخصوصية",
    termsTitle: "شروط الخدمة",
    legalTitle: "إشعار قانوني",
    privacyUpdated: "آخر تحديث: مايو 2026",
    termsUpdated: "آخر تحديث: مايو 2026",
    legalUpdated: "آخر تحديث: مايو 2026",
    privacyContact:
      "لأي استفسار متعلق بالخصوصية أو بياناتك الشخصية، يمكنك التواصل معنا عبر:",
    privacy: [
      block("1. المقدمة", [
        "توضح هذه السياسة كيف تقوم كانترا بجمع البيانات الشخصية واستخدامها وحمايتها عند استخدام المنصة أو التواصل معنا أو الاستفادة من خدمات مساحة العمل للوكالات.",
        "باستخدامك للمنصة، فإنك تقرّ بأنك قرأت هذه السياسة وفهمت طريقة تعامل كانترا مع بياناتك.",
      ]),
      block("2. المعلومات التي نجمعها", [
        "قد نجمع المعلومات التي تقدمها لنا مباشرة، مثل:",
        [
          "الاسم",
          "البريد الإلكتروني",
          "رقم الجوال",
          "اسم الشركة أو الفريق",
          "معلومات الحساب",
          "بيانات المشاريع والوحدات والعملاء التي يتم إدخالها في مساحة العمل",
          "الرسائل والاستفسارات المرسلة عبر نماذج التواصل",
        ],
        "كما قد نجمع بيانات تقنية عند استخدام المنصة، مثل عنوان IP، نوع المتصفح، الجهاز المستخدم، وسجلات الاستخدام لتحسين الأداء والأمان.",
      ]),
      block("3. كيف نستخدم المعلومات", [
        "نستخدم البيانات للأغراض التالية:",
        [
          "إنشاء الحسابات وإدارة مساحات العمل",
          "تشغيل خدمات المنصة وإدارة المشاريع والوحدات والعملاء",
          "تحسين تجربة المستخدم وتطوير خصائص المنصة",
          "تقديم الدعم الفني والتشغيلي",
          "إرسال التنبيهات والتحديثات المرتبطة بالخدمة",
          "تعزيز الأمان ومنع الاستخدام غير المصرح به",
          "الالتزام بالمتطلبات النظامية والتنظيمية عند الحاجة",
        ],
      ]),
      block("4. مشاركة البيانات", [
        "لا نبيع بياناتك الشخصية.",
        "قد نشارك بعض البيانات عند الحاجة مع:",
        [
          "مزودي الخدمات التقنية والاستضافة",
          "أدوات التكامل التي تختار ربطها بالمنصة",
          "الجهات النظامية عند وجود التزام قانوني",
          "أعضاء فريقك أو المستخدمين المصرح لهم داخل مساحة العمل بحسب الصلاحيات المحددة",
        ],
        "وتتم مشاركة البيانات بالحد اللازم لتقديم الخدمة أو الامتثال للمتطلبات النظامية.",
      ]),
      block("5. حماية البيانات", [
        "تتخذ كانترا إجراءات تقنية وتنظيمية لحماية البيانات من الوصول غير المصرح به أو الفقدان أو التعديل أو الإفصاح غير المشروع.",
        "وتشمل هذه الإجراءات إدارة الصلاحيات، التحكم في الوصول، مراقبة الأنشطة، واستخدام مزودي خدمات موثوقين.",
      ]),
      block("6. الاحتفاظ بالبيانات", [
        "نحتفظ بالبيانات طوال مدة استخدامك للمنصة أو حسب ما تقتضيه أغراض التشغيل أو المتطلبات النظامية.",
        "وعند انتهاء الحاجة إلى البيانات، يتم حذفها أو إخفاء هويتها وفق الإجراءات المعتمدة.",
      ]),
      block("7. حقوق المستخدم", [
        "يحق لك، بحسب الأنظمة المعمول بها، طلب:",
        [
          "الاطلاع على بياناتك",
          "تصحيح البيانات غير الدقيقة",
          "تحديث البيانات الناقصة",
          "طلب حذف البيانات عند عدم الحاجة إليها",
          "سحب الموافقة متى كان الاعتماد على الموافقة أساسًا للمعالجة",
        ],
        "يمكن إرسال الطلبات عبر بيانات التواصل الموضحة في هذه السياسة.",
      ]),
      block("8. ملفات الارتباط والتقنيات المشابهة", [
        "قد تستخدم كانترا ملفات الارتباط لتحسين تجربة الاستخدام، تحليل الأداء، وحفظ تفضيلات المستخدم.",
        "يمكنك التحكم في ملفات الارتباط من إعدادات المتصفح، وقد يؤثر تعطيلها على بعض وظائف المنصة.",
      ]),
      block("9. التحديثات على السياسة", [
        "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر النسخة المحدثة داخل هذه الصفحة مع توضيح تاريخ آخر تحديث.",
        "استمرارك في استخدام المنصة بعد التحديث يعني اطلاعك على النسخة الجديدة.",
      ]),
    ],
    terms: [
      block(
        "1. قبول الشروط",
        "باستخدامك لمنصة كانترا أو الوصول إلى أي من خدماتها، فإنك توافق على الالتزام بهذه الشروط والسياسات المرتبطة بها.\n\nإذا كنت تستخدم المنصة نيابة عن شركة أو مؤسسة، فإنك تقر بأن لديك الصلاحية النظامية لتمثيلها والالتزام بهذه الشروط نيابة عنها.",
      ),
      block(
        "2. وصف المنصة",
        "توفر كانترا مساحة عمل مدعومة بالذكاء الاصطناعي تساعد الوكالات، وفرق الخدمات المهنية على إدارة المشاريع، المهام، العملاء، البيانات، والتكاملات من خلال بيئة تشغيل موحدة.\n\nتسعى المنصة إلى تحسين كفاءة التشغيل، توحيد البيانات، وتسريع متابعة الفرص، ولا تُعد بديلاً عن التحقق المهني أو النظامي من المعلومات قبل اتخاذ القرارات التجارية أو التعاقدية.",
      ),
      block(
        "3. مسؤولية الحساب",
        "أنت مسؤول عن الحفاظ على سرية بيانات الدخول، وإدارة صلاحيات المستخدمين داخل مساحة العمل، وجميع الأنشطة التي تتم من خلال حسابك.\n\nيجب عليك إبلاغ فريق كانترا فورًا عند الاشتباه في أي استخدام غير مصرح به أو اختراق أو فقدان لبيانات الدخول.",
      ),
      block(
        "4. دقة البيانات",
        "تتحمل المؤسسة أو المستخدم مسؤولية صحة ودقة البيانات التي يتم إدخالها في المنصة، بما في ذلك بيانات المشاريع، الوحدات، الأسعار، المخزون، العملاء، المرفقات، والعروض.\n\nلا تتحمل كانترا مسؤولية القرارات أو التعاملات الناتجة عن بيانات غير صحيحة، غير محدثة، أو مدخلة من قبل المستخدم بشكل خاطئ.",
      ),
      block(
        "5. التكاملات والخدمات الخارجية",
        "قد تتيح كانترا ربط المنصة بأدوات أو خدمات خارجية، مثل تطبيقات التواصل، أنظمة الأتمتة، واجهات API، أو خدمات الشركاء.\n\nيقر المستخدم بأن استخدام أي تكامل خارجي يخضع لشروط وسياسات مزود الخدمة الخارجي، وأن كانترا لا تتحمل مسؤولية أي خلل أو توقف أو تغيير يصدر من تلك الخدمات خارج نطاق سيطرتها المباشرة.",
      ),
      block(
        "6. حدود المسؤولية",
        "تُقدم كانترا خدماتها كما هي ووفق الإمكانات المتاحة، وتسعى إلى ضمان استقرار المنصة ودقة التشغيل قدر الإمكان.\n\nولا تتحمل كانترا مسؤولية أي خسائر غير مباشرة أو تبعية، أو فقدان فرص تجارية، أو أضرار ناتجة عن سوء استخدام المنصة، أو إدخال بيانات غير دقيقة، أو الاعتماد على معلومات غير محدثة من قبل المستخدمين أو الأطراف المرتبطة بهم.",
      ),
      block(
        "7. القانون الحاكم",
        "تخضع هذه الشروط وتُفسر وفق الأنظمة المعمول بها في المنطقة التي تعمل فيها المؤسسة.\n\nوفي حال نشوء أي نزاع يتعلق باستخدام المنصة أو هذه الشروط، يتم السعي أولًا إلى تسويته وديًا، وفي حال تعذر ذلك تكون الجهة القضائية المختصة في المنطقة المعنية هي المرجع للفصل في النزاع.",
      ),
      block(
        "8. تعديل الشروط",
        "يحق لـ كانترا تحديث هذه الشروط من وقت لآخر بما يتناسب مع تطوير المنصة أو المتطلبات التشغيلية أو النظامية.\n\nسيتم نشر النسخة المحدثة داخل هذه الصفحة، ويُعد استمرار استخدام المنصة بعد التحديث قبولًا بالشروط المعدلة.",
      ),
      block(
        "9. التواصل",
        "لأي استفسار متعلق بشروط الخدمة، يمكن التواصل مع فريق كانترا عبر:\n\nhello@qentrah.com",
      ),
    ],
    legal: [
      block("1. معلومات الشركة", [
        "تُدار منصة كانترا وتُشغَّل كمنصة مساحة عمل تقدم حلولًا تشغيلية للوكالات، وفرق الخدمات المهنية.",
        [
          "المقر: المنطقة المسجلة للعمل",
          "الرقم الضريبي: وفق المتطلبات النظامية المعتمدة",
        ],
      ]),
      block(
        "2. الامتثال التنظيمي",
        "تعمل كانترا وفق الأنظمة المعمول بها في المنطقة التي تعمل فيها، بما يشمل المتطلبات ذات الصلة بالخدمات الإلكترونية، حماية البيانات، والتعاملات الرقمية.",
      ),
      block(
        "3. الملكية الفكرية",
        "جميع العلامات التجارية، الشعارات، التصاميم، النصوص، البرمجيات، الواجهات، والمحتويات المعروضة على المنصة مملوكة لـ كانترا أو مرخّصة لها.\n\nيحظر نسخ أو إعادة استخدام أو توزيع أي جزء من المنصة دون موافقة خطية مسبقة.",
      ),
      block(
        "4. استخدام المنصة",
        "يجب استخدام المنصة للأغراض المصرح بها فقط، وبما لا يخالف الأنظمة أو حقوق الأطراف الأخرى أو شروط الخدمة المعتمدة من كانترا.\n\nتحتفظ كانترا بحق تعليق أو تقييد الوصول إلى المنصة عند وجود استخدام مخالف أو نشاط غير مصرح به.",
      ),
      block(
        "5. دقة المعلومات",
        "تعتمد المنصة على البيانات التي يتم إدخالها أو تحديثها من قبل المستخدمين أو الجهات المصرح لها داخل مساحة العمل.\n\nلذلك، يتحمل المستخدم أو الجهة المالكة للحساب مسؤولية دقة بيانات المشاريع، الوحدات، الأسعار، المخزون، العملاء، والمرفقات المدخلة في المنصة.",
      ),
      block(
        "6. حدود المسؤولية",
        "تقدم كانترا خدماتها وفق الإمكانات المتاحة، وتسعى إلى الحفاظ على استقرار المنصة ودقة التشغيل.\n\nولا تتحمل كانترا مسؤولية أي خسائر مباشرة أو غير مباشرة ناتجة عن سوء استخدام المنصة، أو إدخال بيانات غير دقيقة، أو الاعتماد على معلومات غير محدثة من قبل المستخدمين.",
      ),
      block(
        "7. حماية البيانات",
        "تتعامل كانترا مع البيانات الشخصية وفق سياسة الخصوصية المعتمدة، وبما يتوافق مع المتطلبات النظامية ذات الصلة بحماية البيانات الشخصية.\n\nلمزيد من التفاصيل، يرجى مراجعة سياسة الخصوصية الخاصة بالمنصة.",
      ),
      block(
        "8. تسوية النزاعات",
        "تخضع هذه الصفحة وأي نزاع متعلق باستخدام المنصة للأنظمة المعمول بها في المنطقة المعنية.\n\nوفي حال نشوء أي نزاع، يتم السعي أولًا إلى تسويته وديًا، وفي حال تعذر ذلك يكون الاختصاص للجهات القضائية المختصة في المنطقة المعنية.",
      ),
      block(
        "9. التواصل القانوني",
        "لأي استفسار قانوني متعلق بالمنصة، يمكن التواصل عبر:\n\nlegal@qentrah.com",
      ),
    ],
  },
  fr: {
    privacyTitle: "Politique de confidentialité",
    termsTitle: "Conditions d'utilisation",
    legalTitle: "Mentions légales",
    privacyUpdated: "Dernière mise à jour : mai 2026",
    termsUpdated: "Dernière mise à jour : mai 2026",
    legalUpdated: "Dernière mise à jour : mai 2026",
    privacyContact:
      "Si vous avez des questions sur la confidentialité, contactez-nous à",
    privacy: [
      block(
        "1. Introduction",
        "Bienvenue chez Qentrah. Votre vie privée et la sécurité de vos données sont essentielles pour nous. Cette politique explique comment Qentrah collecte, utilise et protège vos informations lorsque vous utilisez notre espace de travail intelligent.",
      ),
      block(
        "2. Collecte et utilisation des données",
        "Nous collectons les informations nécessaires pour fournir et améliorer le service Qentrah, y compris les détails du compte, les données de l'espace de travail et les métriques d'utilisation. Vos données sont utilisées exclusivement pour faire fonctionner la plateforme et améliorer votre expérience.",
      ),
      block(
        "3. IA et traitement des données",
        "Qentrah utilise l'IA pour faire fonctionner votre espace de travail. Nous garantissons que les données traitées par nos modèles d'IA sont sécurisées et utilisées uniquement pour fournir des fonctionnalités à votre espace de travail spécifique.",
      ),
      block(
        "4. Sécurité des données",
        "Nous mettons en œuvre des mesures de sécurité conformes aux normes de l'industrie pour protéger vos données contre tout accès non autorisé.",
      ),
      block(
        "5. Cookies et suivi",
        "Qentrah utilise des cookies pour maintenir les sessions utilisateur, mémoriser les préférences et analyser les performances de la plateforme.",
      ),
      block(
        "6. Vos droits",
        "Vous avez le droit d'accéder, de corriger ou de supprimer vos données personnelles à tout moment. Pour exercer ces droits, contactez-nous à hello@qentrah.com.",
      ),
      block(
        "7. Modifications de cette politique",
        "Cette politique peut être mise à jour. Nous vous informerons de tout changement important par email ou via l'application.",
      ),
    ],
    terms: [
      block(
        "1. Acceptation des conditions",
        "En accédant ou en utilisant la plateforme, vous acceptez ces conditions d'utilisation. Si vous utilisez la plateforme pour une organisation, vous confirmez être autorisé à engager cette organisation.",
      ),
      block(
        "2. Description de la plateforme",
        "La plateforme fournit un espace de travail intelligent, des outils de gestion de projets et d'opérations clients pour les agences et équipes de services professionnels autorisées.",
      ),
      block(
        "3. Responsabilités du compte",
        "Vous êtes responsable des identifiants de compte, des informations d'inscription exactes et de l'utilisation conforme de la plateforme.",
      ),
      block(
        "4. Exactitude des données",
        "Les organisations sont responsables de l'exactitude des données soumises à la plateforme.",
      ),
      block(
        "5. Intégrations",
        "Les outils connectés et intégrations partenaires sont soumis à approbation et exigences de sécurité.",
      ),
      block(
        "6. Limitation de responsabilité",
        "La plateforme est fournie telle quelle dans la limite permise par la loi. Nous ne sommes pas responsables des dommages indirects.",
      ),
      block(
        "7. Droit applicable",
        "Ces conditions sont régies par les lois de la juridiction dans laquelle l'organisation opère.",
      ),
    ],
    legal: [
      block("Informations sur la société", [
        `${brandProductName("workspace", "en")} est exploité par ${brandIdentity.legalName.en}.`,
        [
          "Siège social : région d'exploitation telle qu'enregistrée",
        ],
      ]),
      block(
        "Conformité réglementaire",
        "La plateforme opère conformément aux réglementations applicables en matière de protection des données et de services électroniques.",
      ),
      block(
        "Propriété intellectuelle",
        "Tout le contenu, marques, logos et propriété intellectuelle affichés sur cette plateforme sont la propriété de l'entreprise ou de leurs propriétaires respectifs.",
      ),
      block(
        "Résolution des litiges",
        "Tout litige découlant de l'utilisation de cette plateforme est soumis aux tribunaux compétents de la juridiction concernée.",
      ),
    ],
  },
} as const;

const content = {
  en: {
    nav: {
      brand: brandLabel("en"),
      products: "Products",
      privacy: workspaceEn.Landing.footer.privacy,
      terms: workspaceEn.Landing.footer.terms,
      legal: workspaceEn.Landing.footer.legal,
      workspace: workspaceEn.Landing.nav.dashboard,
      partners: partnersEnName,
      language: "العربية",
    },
    products: [
      {
        id: "workspace",
        name: workspaceEnName,
        status: workspaceEn.Landing.footer.workspace,
        href: productUrls.workspace,
        cta: workspaceEn.Landing.home.hero.primary,
        description: workspaceEn.Landing.home.hero.description,
      },
      {
        id: "partners",
        name: partnersEnName,
        status: partnersEnName,
        href: productUrls.partners,
        cta: partnersEnName,
        description: workspaceLegal.en.terms[1].body,
      },
    ] as const,
    legal: workspaceLegal.en,
  },
  ar: {
    nav: {
      brand: brandLabel("ar"),
      products: "المنتجات",
      privacy: workspaceAr.Landing.footer.privacy,
      terms: workspaceAr.Landing.footer.terms,
      legal: workspaceAr.Landing.footer.legal,
      workspace: workspaceAr.Landing.nav.dashboard,
      partners: partnersArName,
      language: "English",
    },
    products: [
      {
        id: "workspace",
        name: workspaceArName,
        status: workspaceAr.Landing.footer.workspace,
        href: productUrls.workspace,
        cta: workspaceAr.Landing.home.hero.primary,
        description: workspaceAr.Landing.home.hero.description,
      },
      {
        id: "partners",
        name: partnersArName,
        status: partnersArName,
        href: productUrls.partners,
        cta: partnersArName,
        description: workspaceLegal.ar.terms[1].body,
      },
    ] as const,
    legal: workspaceLegal.ar,
  },
  fr: {
    nav: {
      brand: brandLabel("en"),
      products: "Produits",
      privacy: "Confidentialité",
      terms: "Conditions",
      legal: "Mentions légales",
      workspace: "Tableau de bord",
      partners: "Partenaires",
      language: "Français",
    },
    products: [
      {
        id: "workspace",
        name: brandProductName("workspace", "en"),
        status: "Espace de travail",
        href: productUrls.workspace,
        cta: "Commencer gratuitement",
        description:
          "Un espace de travail intelligent pour gérer vos projets, clients et équipes avec l'aide de l'IA.",
      },
      {
        id: "partners",
        name: "Partenaires",
        status: "Partenaires",
        href: productUrls.partners,
        cta: "Partenaires",
        description:
          "Devenez partenaire de Qentrah et intégrez vos services à notre plateforme.",
      },
    ] as const,
    legal: workspaceLegal.fr,
  },
} as const;

export function getContent(locale: Locale) {
  return content[locale];
}

export { marketingHero, testimonials, marketingNav, marketingFooter };
