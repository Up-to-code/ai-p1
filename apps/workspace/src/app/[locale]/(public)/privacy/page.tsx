"use client";

import { useLocale } from "next-intl";

import { LegalArticle, LegalBlock } from "@/components/landing/public-page-shell";
import { brandDomainUrl } from "@qentrah/brand-identity";

const copy = {
  en: {
    eyebrow: "Policy",
    title: "Privacy Policy",
    updated: "Last updated: May 4, 2026",
    blocks: [
      ["1. Introduction", "Qentrah Workspace operates a real estate workspace and data synchronization platform for teams in Saudi Arabia. This policy explains how we collect, use, disclose, and protect information when you use the platform."],
      ["2. Information We Collect", "We collect information you provide directly, including name, email, phone, organization details, commercial registration information, and documents submitted during onboarding. We may also collect device, IP, browser, and usage information."],
      ["3. How We Use Information", "We use information to verify organizations, manage accounts, support workspace features, synchronize property data, operate integrations, provide support, and meet applicable Saudi regulatory and compliance requirements."],
      ["4. Data Sharing", "We share data only with authorized users, service providers, and connected platforms you approve. We do not sell personal data."],
      ["5. Data Security", "We use reasonable security measures, including access controls, encryption, audit logging, and secure integration handling."],
      ["6. Data Retention", "We retain data while your account is active or as needed for service, security, legal, and compliance purposes."],
    ],
    contact: "If you have privacy questions, contact us at",
  },
  ar: {
    eyebrow: "سياسة",
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 4 مايو 2026",
    blocks: [
      ["1. المقدمة", "تشغل كانترا مساحة عمل عقارية ومنصة لمزامنة البيانات للفرق العاملة في السعودية. توضح هذه السياسة كيف نجمع المعلومات ونستخدمها ونشاركها ونحميها عند استخدام المنصة."],
      ["2. المعلومات التي نجمعها", "نجمع المعلومات التي تقدمها مباشرة، مثل الاسم والبريد ورقم الهاتف وبيانات المؤسسة ومعلومات السجل التجاري والمستندات المقدمة أثناء التهيئة. قد نجمع أيضاً بيانات الجهاز وعنوان IP ونوع المتصفح وأنماط الاستخدام."],
      ["3. كيف نستخدم المعلومات", "نستخدم المعلومات للتحقق من المؤسسات، إدارة الحسابات، تشغيل ميزات مساحة العمل، مزامنة البيانات العقارية، دعم التكاملات، تقديم المساندة، والالتزام بالمتطلبات التنظيمية في السعودية."],
      ["4. مشاركة البيانات", "نشارك البيانات فقط مع المستخدمين المصرح لهم، مزودي الخدمة، والمنصات المتصلة التي توافق عليها. لا نبيع البيانات الشخصية."],
      ["5. أمن البيانات", "نستخدم إجراءات أمنية معقولة تشمل ضوابط الوصول، التشفير، سجلات التدقيق، والتعامل الآمن مع التكاملات."],
      ["6. الاحتفاظ بالبيانات", "نحتفظ بالبيانات ما دام الحساب نشطاً أو حسب الحاجة للخدمة والأمن والمتطلبات القانونية والامتثال."],
    ],
    contact: "لأسئلة الخصوصية، تواصل معنا على",
  },
};

export default function PrivacyPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const c = isAr ? copy.ar : copy.en;
  const privacyEmail = `privacy@${brandDomainUrl("root").replace("https://", "")}`;

  return (
    <LegalArticle eyebrow={c.eyebrow} title={c.title} updated={c.updated}>
      {c.blocks.map(([title, body]) => (
        <LegalBlock key={title} title={title}>
          <p>{body}</p>
        </LegalBlock>
      ))}
      <LegalBlock title={isAr ? "7. تواصل معنا" : "7. Contact Us"}>
        <p>
          {c.contact}{" "}
          <a href={`mailto:${privacyEmail}`} className="font-black text-blue-600 hover:underline dark:text-blue-300">
            {privacyEmail}
          </a>
          .
        </p>
      </LegalBlock>
    </LegalArticle>
  );
}
