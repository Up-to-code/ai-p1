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
      ["Regulatory Compliance", "The platform operates in accordance with applicable Saudi real estate, data protection, and electronic service requirements."],
      ["Intellectual Property", "All content, trademarks, logos, and intellectual property displayed on this platform are owned by the company or their respective owners. Unauthorized use is prohibited."],
      ["Dispute Resolution", "Any disputes arising from the use of this platform are subject to the competent courts of Riyadh, Kingdom of Saudi Arabia."],
    ],
  },
  ar: {
    eyebrow: "قانوني",
    title: "إشعار قانوني",
    updated: "آخر تحديث: 4 مايو 2026",
    company: "معلومات الشركة",
    headquarters: "المقر: الرياض، المملكة العربية السعودية",
    vat: "الرقم الضريبي: 3XXXXXXXXXX0003",
    blocks: [
      ["الامتثال التنظيمي", "تعمل المنصة وفق المتطلبات السعودية ذات الصلة بالعقار وحماية البيانات والخدمات الإلكترونية."],
      ["الملكية الفكرية", "جميع المحتويات والعلامات والشعارات والحقوق الفكرية المعروضة على هذه المنصة مملوكة للشركة أو لأصحابها المعنيين. يحظر الاستخدام غير المصرح به."],
      ["تسوية النزاعات", "تخضع أي نزاعات ناتجة عن استخدام هذه المنصة لاختصاص المحاكم المختصة في الرياض، المملكة العربية السعودية."],
    ],
  },
};

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
        <p>{workspaceName} {isAr ? "تدار بواسطة" : "is operated by"} {legalName}.</p>
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
          <p>{body}</p>
        </LegalBlock>
      ))}
    </LegalArticle>
  );
}
