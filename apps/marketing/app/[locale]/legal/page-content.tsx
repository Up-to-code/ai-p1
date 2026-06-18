"use client";

import { useLocale } from "next-intl";

import { LegalArticle, LegalBlock } from "@/components/landing/public-page-shell";
import { brandDomainUrl, brandIdentity, brandProductName } from "@qentrah/brand-identity";

const copy = {
  en: {
    eyebrow: "Legal",
    title: "Legal Notice",
    updated: "Last updated: May 4, 2026",
    company: "Company Information",
    headquarters: "Headquarters: Riyadh, Kingdom of Saudi Arabia",
    vat: "VAT Registration: 3XXXXXXXXXX0003",
    blocks: [
      ["Regulatory Compliance", "The platform operates in accordance with applicable data protection, electronic service, and business operations requirements."],
      ["Intellectual Property", "All content, trademarks, logos, and intellectual property displayed on this platform are owned by the company or their respective owners. Unauthorized use is prohibited."],
      ["Dispute Resolution", "Any disputes arising from the use of this platform are subject to the competent courts of Riyadh, Kingdom of Saudi Arabia."],
    ],
  },
  ar: {
    eyebrow: "قانوني",
    title: "إشعار قانوني",
    updated: "آخر تحديث: مايو 2026",
    company: "1. معلومات الشركة",
    companyDescription: "تُدار منصة كانترا بواسطة شركة إتجاه التقنية، وهي منصة مساحة عمل تقدم حلولًا تشغيلية للفرق والشركات.",
    headquarters: "المقر: جدة، المملكة العربية السعودية",
    vat: "الرقم الضريبي: 310425795900003",
    blocks: [
      ["2. الامتثال التنظيمي", "تعمل كانترا وفق الأنظمة المعمول بها في المملكة العربية السعودية، بما يشمل المتطلبات ذات الصلة بالخدمات الإلكترونية، حماية البيانات، والتعاملات الرقمية."],
      ["3. الملكية الفكرية", "جميع العلامات التجارية، الشعارات، التصاميم، النصوص، البرمجيات، الواجهات، والمحتويات المعروضة على المنصة مملوكة لـ كانترا أو مرخّصة لها.\n\nيحظر نسخ أو إعادة استخدام أو توزيع أي جزء من المنصة دون موافقة خطية مسبقة."],
      ["4. استخدام المنصة", "يجب استخدام المنصة للأغراض المصرح بها فقط، وبما لا يخالف الأنظمة أو حقوق الأطراف الأخرى أو شروط الخدمة المعتمدة من كانترا.\n\nتحتفظ كانترا بحق تعليق أو تقييد الوصول إلى المنصة عند وجود استخدام مخالف أو نشاط غير مصرح به."],
      ["5. دقة المعلومات", "تعتمد المنصة على البيانات التي يتم إدخالها أو تحديثها من قبل المستخدمين أو الجهات المصرح لها داخل مساحة العمل.\n\nلذلك، يتحمل المستخدم أو الجهة المالكة للحساب مسؤولية دقة بيانات المشاريع، الأصول، العملاء، والمرفقات المدخلة في المنصة."],
      ["6. حدود المسؤولية", "تقدم كانترا خدماتها وفق الإمكانات المتاحة، وتسعى إلى الحفاظ على استقرار المنصة ودقة التشغيل.\n\nولا تتحمل كانترا مسؤولية أي خسائر مباشرة أو غير مباشرة ناتجة عن سوء استخدام المنصة، أو إدخال بيانات غير دقيقة، أو الاعتماد على معلومات غير محدثة من قبل المستخدمين."],
      ["7. حماية البيانات", "تتعامل كانترا مع البيانات الشخصية وفق سياسة الخصوصية المعتمدة، وبما يتوافق مع المتطلبات النظامية ذات الصلة بحماية البيانات الشخصية في المملكة العربية السعودية.\n\nلمزيد من التفاصيل، يرجى مراجعة سياسة الخصوصية الخاصة بالمنصة."],
      ["8. تسوية النزاعات", "تخضع هذه الصفحة وأي نزاع متعلق باستخدام المنصة للأنظمة المعمول بها في المملكة العربية السعودية.\n\nوفي حال نشوء أي نزاع، يتم السعي أولًا إلى تسويته وديًا، وفي حال تعذر ذلك يكون الاختصاص للجهات القضائية المختصة في المملكة العربية السعودية."],
      ["9. التواصل القانوني", "لأي استفسار قانوني متعلق بالمنصة، يمكن التواصل عبر:\n\nlegal@qentrah.com"],
    ],
  },
};

function getCompanyDescription({
  isAr,
  c,
  workspaceName,
  legalName,
}: {
  isAr: boolean;
  c: typeof copy.ar | typeof copy.en;
  workspaceName: string;
  legalName: string;
}) {
  return isAr && "companyDescription" in c ? c.companyDescription : `${workspaceName} is operated by ${legalName}.`;
}

export default function LegalPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const c = isAr ? copy.ar : copy.en;
  const workspaceName = brandProductName("workspace", isAr ? "ar" : "en");
  const legalName = isAr ? brandIdentity.legalName.ar : brandIdentity.legalName.en;
  const legalEmail = `legal@${brandDomainUrl("root").replace("https://", "")}`;

  return (
    <LegalArticle eyebrow={c.eyebrow} title={c.title} updated={c.updated}>
      <LegalBlock title={c.company}>
        <p>{getCompanyDescription({ isAr, c, workspaceName, legalName })}</p>
        <ul className="list-inside list-disc space-y-1">
          <li>{c.headquarters}</li>
          <li>
            {isAr ? "البريد:" : "Email:"}{" "}
            <a href={`mailto:${legalEmail}`} className="font-black text-blue-600 hover:underline dark:text-blue-300">
              {legalEmail}
            </a>
          </li>
          <li>{c.vat}</li>
        </ul>
      </LegalBlock>

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
