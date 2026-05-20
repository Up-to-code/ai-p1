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
      ["2. Platform Description", "The platform provides real estate workspace, data management, synchronization, and integration tools for authorized developers, brokers, operators, and partners."],
      ["3. Account Responsibilities", "You are responsible for account credentials, accurate onboarding information, and lawful use of the platform. Fraudulent or misleading information may result in suspension or termination."],
      ["4. Data Accuracy", "Organizations are responsible for the accuracy of project, property, client, and operational data submitted to the platform."],
      ["5. Integrations", "Connected tools and partner integrations are subject to approval, scoped access, and security requirements. We may suspend integrations that misuse data or violate platform rules."],
      ["6. Limitation of Liability", "The platform is provided as is to the extent permitted by law. We are not liable for indirect or consequential damages arising from use of the platform."],
      ["7. Governing Law", "These Terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes are resolved by the competent courts of Riyadh."],
    ],
  },
  ar: {
    eyebrow: "الشروط",
    title: "شروط الخدمة",
    updated: "آخر تحديث: 4 مايو 2026",
    blocks: [
      ["1. قبول الشروط", "باستخدام المنصة أو الوصول إليها، فإنك توافق على شروط الخدمة هذه. إذا كنت تستخدم المنصة نيابة عن مؤسسة، فأنت تقر بأن لديك صلاحية إلزام تلك المؤسسة."],
      ["2. وصف المنصة", "توفر المنصة مساحة عمل عقارية وأدوات لإدارة البيانات والمزامنة والتكامل للمطورين والوسطاء والمشغلين والشركاء المصرح لهم."],
      ["3. مسؤوليات الحساب", "أنت مسؤول عن بيانات الدخول، ودقة معلومات التهيئة، والاستخدام النظامي للمنصة. قد تؤدي المعلومات المضللة أو غير الصحيحة إلى تعليق الحساب أو إنهائه."],
      ["4. دقة البيانات", "تتحمل المؤسسات مسؤولية دقة بيانات المشاريع والعقارات والعملاء والعمليات التي يتم إدخالها في المنصة."],
      ["5. التكاملات", "تخضع الأدوات المتصلة وتكاملات الشركاء للموافقة والصلاحيات المحددة ومتطلبات الأمان. قد نعلق أي تكامل يسيء استخدام البيانات أو يخالف قواعد المنصة."],
      ["6. حدود المسؤولية", "تقدم المنصة كما هي بالقدر المسموح به نظاماً. لا نتحمل مسؤولية الأضرار غير المباشرة أو التبعية الناتجة عن استخدام المنصة."],
      ["7. القانون الحاكم", "تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتختص محاكم الرياض بالنظر في النزاعات."],
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
          <p>{body}</p>
        </LegalBlock>
      ))}
    </LegalArticle>
  );
}
