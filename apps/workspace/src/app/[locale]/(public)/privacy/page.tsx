"use client";

import type { ReactNode } from "react";
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
    updated: "آخر تحديث: مايو 2026",
    blocks: [
      ["1. المقدمة", ["توضح هذه السياسة كيف تقوم كانترا بجمع البيانات الشخصية واستخدامها وحمايتها عند استخدام المنصة أو التواصل معنا أو الاستفادة من خدمات مساحة العمل العقارية.", "باستخدامك للمنصة، فإنك تقرّ بأنك قرأت هذه السياسة وفهمت طريقة تعامل كانترا مع بياناتك."]],
      ["2. المعلومات التي نجمعها", ["قد نجمع المعلومات التي تقدمها لنا مباشرة، مثل:", ["الاسم", "البريد الإلكتروني", "رقم الجوال", "اسم الشركة أو الفريق", "معلومات الحساب", "بيانات المشاريع والوحدات والعملاء التي يتم إدخالها في مساحة العمل", "الرسائل والاستفسارات المرسلة عبر نماذج التواصل"], "كما قد نجمع بيانات تقنية عند استخدام المنصة، مثل عنوان IP، نوع المتصفح، الجهاز المستخدم، وسجلات الاستخدام لتحسين الأداء والأمان."]],
      ["3. كيف نستخدم المعلومات", ["نستخدم البيانات للأغراض التالية:", ["إنشاء الحسابات وإدارة مساحات العمل", "تشغيل خدمات المنصة وإدارة المشاريع والوحدات والعملاء", "تحسين تجربة المستخدم وتطوير خصائص المنصة", "تقديم الدعم الفني والتشغيلي", "إرسال التنبيهات والتحديثات المرتبطة بالخدمة", "تعزيز الأمان ومنع الاستخدام غير المصرح به", "الالتزام بالمتطلبات النظامية والتنظيمية عند الحاجة"]]],
      ["4. مشاركة البيانات", ["لا نبيع بياناتك الشخصية.", "قد نشارك بعض البيانات عند الحاجة مع:", ["مزودي الخدمات التقنية والاستضافة", "أدوات التكامل التي تختار ربطها بالمنصة", "الجهات النظامية عند وجود التزام قانوني", "أعضاء فريقك أو المستخدمين المصرح لهم داخل مساحة العمل بحسب الصلاحيات المحددة"], "وتتم مشاركة البيانات بالحد اللازم لتقديم الخدمة أو الامتثال للمتطلبات النظامية."]],
      ["5. حماية البيانات", ["تتخذ كانترا إجراءات تقنية وتنظيمية لحماية البيانات من الوصول غير المصرح به أو الفقدان أو التعديل أو الإفصاح غير المشروع.", "وتشمل هذه الإجراءات إدارة الصلاحيات، التحكم في الوصول، مراقبة الأنشطة، واستخدام مزودي خدمات موثوقين."]],
      ["6. الاحتفاظ بالبيانات", ["نحتفظ بالبيانات طوال مدة استخدامك للمنصة أو حسب ما تقتضيه أغراض التشغيل أو المتطلبات النظامية.", "وعند انتهاء الحاجة إلى البيانات، يتم حذفها أو إخفاء هويتها وفق الإجراءات المعتمدة."]],
      ["7. حقوق المستخدم", ["يحق لك، بحسب الأنظمة المعمول بها، طلب:", ["الاطلاع على بياناتك", "تصحيح البيانات غير الدقيقة", "تحديث البيانات الناقصة", "طلب حذف البيانات عند عدم الحاجة إليها", "سحب الموافقة متى كان الاعتماد على الموافقة أساسًا للمعالجة"], "يمكن إرسال الطلبات عبر بيانات التواصل الموضحة في هذه السياسة."]],
      ["8. ملفات الارتباط والتقنيات المشابهة", ["قد تستخدم كانترا ملفات الارتباط لتحسين تجربة الاستخدام، تحليل الأداء، وحفظ تفضيلات المستخدم.", "يمكنك التحكم في ملفات الارتباط من إعدادات المتصفح، وقد يؤثر تعطيلها على بعض وظائف المنصة."]],
      ["9. التحديثات على السياسة", ["قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر النسخة المحدثة داخل هذه الصفحة مع توضيح تاريخ آخر تحديث.", "استمرارك في استخدام المنصة بعد التحديث يعني اطلاعك على النسخة الجديدة."]],
    ],
    contact: "لأي استفسار متعلق بالخصوصية أو بياناتك الشخصية، يمكنك التواصل معنا عبر:",
  },
};

type BlockBody = string | Array<string | string[]>;
type LegalCopyBlock = [title: string, body: BlockBody];

export default function PrivacyPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const c = isAr ? copy.ar : copy.en;
  const privacyEmail = `privacy@${brandDomainUrl("root").replace("https://", "")}`;

  return (
    <LegalArticle eyebrow={c.eyebrow} title={c.title} updated={c.updated}>
      {(c.blocks as LegalCopyBlock[]).map(([title, body]) => (
        <LegalBlock key={title} title={title}>
          <RichBlockBody body={body} />
        </LegalBlock>
      ))}
      <LegalBlock title={isAr ? "10. التواصل معنا" : "7. Contact Us"}>
        <p>
          {c.contact}{" "}
          {isAr ? (
            <>
              <br />
              البريد الإلكتروني:{" "}
            </>
          ) : null}
          <a href={`mailto:${privacyEmail}`} className="font-black text-blue-600 hover:underline dark:text-blue-300">
            {privacyEmail}
          </a>
          .
        </p>
      </LegalBlock>
    </LegalArticle>
  );
}

function RichBlockBody({ body }: { body: BlockBody }) {
  const items = Array.isArray(body) ? body : [body];

  return (
    <>
      {items.map((item, index): ReactNode =>
        Array.isArray(item) ? (
          <ul className="my-4 list-disc space-y-2 px-6" key={`list-${index}`}>
            {item.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p key={item}>{item}</p>
        ),
      )}
    </>
  );
}
