import {
  brandDomainUrl,
  brandIdentity,
  brandLabel,
  brandProductName,
} from "@qentrah/brand-identity";

import workspaceAr from "../../workspace/messages/ar.json";
import workspaceEn from "../../workspace/messages/en.json";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
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
  return locale === "ar" ? workspaceAr.Landing : workspaceEn.Landing;
}

export function getMarketingMessages(locale: Locale) {
  return locale === "ar" ? workspaceAr : workspaceEn;
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
        "تُدار منصة كانترا بواسطة شركة إتجاه التقنية، وهي منصة مساحة عمل تقدم حلولًا تشغيلية للوكالات، وفرق الخدمات المهنية.",
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
} as const;

export function getContent(locale: Locale) {
  return content[locale];
}
