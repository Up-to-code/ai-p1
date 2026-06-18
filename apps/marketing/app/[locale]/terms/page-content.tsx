"use client";

import { useLocale } from "next-intl";

import { LegalArticle, LegalBlock } from "@/components/landing/public-page-shell";

const copy = {
  en: {
    eyebrow: "Terms",
    title: "Terms of Service",
    updated: "Last updated: May 4, 2026",
    blocks: [
      ["1. Acceptance of Terms", "By accessing or using the platform, you agree to these Terms of Service. If you use the platform for an organization, you confirm that you are authorized to bind that organization."],
      ["2. Platform Description", "The platform provides workspace, data management, synchronization, and integration tools for authorized teams, operators, and partners."],
      ["3. Account Responsibilities", "You are responsible for account credentials, accurate onboarding information, and lawful use of the platform. Fraudulent or misleading information may result in suspension or termination."],
      ["4. Data Accuracy", "Organizations are responsible for the accuracy of project, asset, client, and operational data submitted to the platform."],
      ["5. Integrations", "Connected tools and partner integrations are subject to approval, scoped access, and security requirements. We may suspend integrations that misuse data or violate platform rules."],
      ["6. Limitation of Liability", "The platform is provided as is to the extent permitted by law. We are not liable for indirect or consequential damages arising from use of the platform."],
      ["7. Governing Law", "These Terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes are resolved by the competent courts of Riyadh."],
    ],
  },
  ar: {
    eyebrow: "الشروط",
    title: "شروط الخدمة",
    updated: "آخر تحديث: مايو 2026",
    blocks: [
      ["1. قبول الشروط", "باستخدامك لمنصة كانترا أو الوصول إلى أي من خدماتها، فإنك توافق على الالتزام بهذه الشروط والسياسات المرتبطة بها.\n\nإذا كنت تستخدم المنصة نيابة عن شركة أو مؤسسة، فإنك تقر بأن لديك الصلاحية النظامية لتمثيلها والالتزام بهذه الشروط نيابة عنها."],
      ["2. وصف المنصة", "توفر كانترا مساحة عمل تساعد الفرق على إدارة المشاريع، الأصول، العملاء، البيانات، والتكاملات من خلال بيئة تشغيل موحدة.\n\nتسعى المنصة إلى تحسين كفاءة التشغيل، توحيد البيانات، وتسريع المتابعة، ولا تُعد بديلاً عن التحقق المهني أو النظامي من المعلومات قبل اتخاذ القرارات التجارية أو التعاقدية."],
      ["3. مسؤولية الحساب", "أنت مسؤول عن الحفاظ على سرية بيانات الدخول، وإدارة صلاحيات المستخدمين داخل مساحة العمل، وجميع الأنشطة التي تتم من خلال حسابك.\n\nيجب عليك إبلاغ فريق كانترا فورًا عند الاشتباه في أي استخدام غير مصرح به أو اختراق أو فقدان لبيانات الدخول."],
      ["4. دقة البيانات", "تتحمل المؤسسة أو المستخدم مسؤولية صحة ودقة البيانات التي يتم إدخالها في المنصة، بما في ذلك بيانات المشاريع، الأصول، الأسعار، العملاء، المرفقات، والعروض.\n\nلا تتحمل كانترا مسؤولية القرارات أو التعاملات الناتجة عن بيانات غير صحيحة، غير محدثة، أو مدخلة من قبل المستخدم بشكل خاطئ."],
      ["5. التكاملات والخدمات الخارجية", "قد تتيح كانترا ربط المنصة بأدوات أو خدمات خارجية، مثل تطبيقات التواصل، أنظمة الأتمتة، واجهات API، أو خدمات الشركاء.\n\nيقر المستخدم بأن استخدام أي تكامل خارجي يخضع لشروط وسياسات مزود الخدمة الخارجي، وأن كانترا لا تتحمل مسؤولية أي خلل أو توقف أو تغيير يصدر من تلك الخدمات خارج نطاق سيطرتها المباشرة."],
      ["6. حدود المسؤولية", "تُقدم كانترا خدماتها كما هي ووفق الإمكانات المتاحة، وتسعى إلى ضمان استقرار المنصة ودقة التشغيل قدر الإمكان.\n\nولا تتحمل كانترا مسؤولية أي خسائر غير مباشرة أو تبعية، أو فقدان فرص تجارية، أو أضرار ناتجة عن سوء استخدام المنصة، أو إدخال بيانات غير دقيقة، أو الاعتماد على معلومات غير محدثة من قبل المستخدمين أو الأطراف المرتبطة بهم."],
      ["7. القانون الحاكم", "تخضع هذه الشروط وتُفسر وفق الأنظمة المعمول بها في المملكة العربية السعودية.\n\nوفي حال نشوء أي نزاع يتعلق باستخدام المنصة أو هذه الشروط، يتم السعي أولًا إلى تسويته وديًا، وفي حال تعذر ذلك تكون الجهة القضائية المختصة في المملكة العربية السعودية هي المرجع للفصل في النزاع."],
      ["8. تعديل الشروط", "يحق لـ كانترا تحديث هذه الشروط من وقت لآخر بما يتناسب مع تطوير المنصة أو المتطلبات التشغيلية أو النظامية.\n\nسيتم نشر النسخة المحدثة داخل هذه الصفحة، ويُعد استمرار استخدام المنصة بعد التحديث قبولًا بالشروط المعدلة."],
      ["9. التواصل", "لأي استفسار متعلق بشروط الخدمة، يمكن التواصل مع فريق كانترا عبر:\n\nhello@qentrah.com"],
    ],
  },
};

export default function TermsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const c = isAr ? copy.ar : copy.en;

  return (
    <LegalArticle eyebrow={c.eyebrow} title={c.title} updated={c.updated}>
      {c.blocks.map(([title, body]) => (
        <LegalBlock key={title} title={title}>
          {body.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </LegalBlock>
      ))}
    </LegalArticle>
  );
}
