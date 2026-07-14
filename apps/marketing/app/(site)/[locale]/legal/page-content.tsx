import { LegalArticle, LegalBlock } from "@/components/design-system";
import { brandDomainUrl, brandIdentity, brandProductName } from "@qentrah/brand-identity";
import { CmsLegalPage } from "@/components/marketing/cms-legal-page";
import type { MarketingLegalPageContent } from "@/lib/content";

function en() {
  const workspaceName = brandProductName("workspace", "en");
  const legalName = brandIdentity.legalName.en;
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "Legal",
    title: "Legal Notice",
    updated: "Last updated: June 28, 2026",
    company: "1. Company Information",
    companyBody: `${workspaceName} is operated by ${legalName}.`,
    headquarters: "Headquarters: Cairo, Arab Republic of Egypt",
    email: `Email: legal@${rootDomain}`,
    vat: "Tax Registration: PENDING_REGISTRATION",
    blocks: [
      ["2. Regulatory Compliance", `${workspaceName} operates in compliance with applicable laws and regulations of the Arab Republic of Egypt, including the Personal Data Protection Law (Law No. 151 of 2020) and the Electronic Signature Law (Law No. 15 of 2004). Users are responsible for ensuring their use of the platform complies with all applicable laws in their jurisdiction.`],
      ["3. Intellectual Property", "All content, trademarks, logos, software, interfaces, design, text, graphics, and functionality on this platform are the exclusive property of the company or its licensors. All rights are reserved.\n\nYou may not reproduce, distribute, modify, create derivative works from, publicly display, or otherwise use any part of the platform without prior written consent. Unauthorized use may result in legal action."],
      ["4. Acceptable Use", "You agree to use the platform only for lawful purposes and in accordance with these terms. You must not use the platform for any fraudulent, abusive, or harmful activity.\n\nProhibited activities include but are not limited to: unauthorized access to systems, data scraping, introducing malware, interfering with platform operations, and impersonating others."],
      ["5. Information Accuracy", `The platform relies on data entered by users and authorized parties within their workspace. The company does not independently verify the accuracy, completeness, or legality of user-submitted data.\n\nUsers and account holders are solely responsible for the accuracy of all project, asset, client, financial, and operational data they input. The company assumes no liability for decisions made based on inaccurate or outdated user-submitted information.`],
      ["6. Third-Party Services & Links", `The platform may link to or integrate with third-party services, websites, or tools. The company does not endorse, control, or assume responsibility for the content, privacy practices, or security of any third party.\n\nAny interactions with third-party services are solely between you and the third party. The company disclaims all liability arising from such interactions.`],
      ["7. Limitation of Liability", `To the maximum extent permitted by applicable law, the company and its founders, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.\n\nThis includes but is not limited to: loss of data, loss of business, loss of profits, service interruption, errors or omissions in content, and damages resulting from unauthorized access to or alteration of your data.`],
      ["8. Disclaimer of Warranties", `The platform and all content provided through it are made available on an "as is" and "as available" basis without warranties of any kind, whether express or implied.\n\nThe company does not warrant that the platform will be uninterrupted, error-free, secure, or free from viruses or other harmful components. The company expressly disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.`],
      ["9. Data Protection", `The company processes personal data in accordance with its Privacy Policy and applicable data protection laws, including the Personal Data Protection Law of the Arab Republic of Egypt (Law No. 151 of 2020).\n\nUsers are encouraged to review the Privacy Policy for detailed information about how their data is collected, used, stored, and protected.`],
      ["10. Dispute Resolution & Governing Law", "These terms and any disputes arising from the use of the platform shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt.\n\nThe parties shall first attempt to resolve any dispute amicably through good-faith negotiations. If the dispute cannot be resolved within 30 days, it shall be referred to the competent courts of Cairo, Arab Republic of Egypt, which shall have exclusive jurisdiction."],
      ["11. Contact for Legal Inquiries", `For any legal inquiries, requests, or notices, please contact us at:\n\nlegal@${rootDomain}\n\nAll legal correspondence must be sent in writing to the registered address of the company.`],
    ] as [string, string][],
  };
}

function ar() {
  const workspaceName = brandProductName("workspace", "ar");
  const legalName = brandIdentity.legalName.ar;
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "قانوني",
    title: "إشعار قانوني",
    updated: "آخر تحديث: 28 يونيو 2026",
    company: "1. معلومات الشركة",
    companyBody: `تُدار منصة ${workspaceName} بواسطة ${legalName}، وهي منصة مساحة عمل تقدم حلولًا تشغيلية للفرق والشركات.`,
    headquarters: "المقر: القاهرة، جمهورية مصر العربية",
    email: `البريد الإلكتروني: legal@${rootDomain}`,
    vat: "الرقم الضريبي: قيد التسجيل",
    blocks: [
      ["2. الامتثال التنظيمي", "تعمل كانترا وفق الأنظمة المعمول بها في جمهورية مصر العربية، بما يشمل قانون حماية البيانات الشخصية (القانون رقم 151 لسنة 2020) وقانون التوقيع الإلكتروني (القانون رقم 15 لسنة 2004). يتحمل المستخدم مسؤولية التأكد من أن استخدامه للمنصة يتوافق مع جميع الأنظمة المعمول بها في نطاقه القانوني."],
      ["3. الملكية الفكرية", "جميع العلامات التجارية، الشعارات، التصاميم، النصوص، البرمجيات، الواجهات، قواعد البيانات، والمحتويات المعروضة على المنصة مملوكة لـ كانترا أو مرخّصة لها. جميع الحقوق محفوظة.\n\nيحظر نسخ أو إعادة استخدام أو توزيع أو تعديل أو إنشاء أعمال مشتقة من أي جزء من المنصة دون موافقة خطية مسبقة. أي استخدام غير مصرح به قد يؤدي إلى اتخاذ إجراءات قانونية."],
      ["4. الاستخدام المسموح", "يجب استخدام المنصة للأغراض المشروعة فقط ووفقًا لهذه الشروط. يُحظر استخدام المنصة في أي نشاط احتيالي أو مسيء أو ضار.\n\nتشمل الأنشطة المحظورة على سبيل المثال لا الحصر: الوصول غير المصرح به للأنظمة، استخراج البيانات، إدخال برمجيات خبيثة، التدخل في تشغيل المنصة، وانتحال شخصية الآخرين."],
      ["5. دقة المعلومات", "تعتمد المنصة على البيانات التي يتم إدخالها أو تحديثها من قبل المستخدمين أو الجهات المصرح لها داخل مساحة العمل. لا تقوم كانترا بالتحقق المستقل من دقة أو اكتمال أو قانونية البيانات المدخلة من قبل المستخدمين.\n\nلذلك، يتحمل المستخدم أو الجهة المالكة للحساب المسؤولية الكاملة عن دقة بيانات المشاريع، الأصول، الأسعار، العملاء، والمرفقات المدخلة في المنصة. لا تتحمل كانترا أي مسؤولية عن القرارات أو التعاملات الناتجة عن بيانات غير صحيحة أو غير محدثة."],
      ["6. الخدمات والروابط الخارجية", "قد تتضمن المنصة روابط لمواقع أو خدمات خارجية، أو تتيح التكامل مع أدوات طرف ثالث. لا تؤيد كانترا هذه الخدمات الخارجية ولا تتحكم فيها ولا تتحمل أي مسؤولية عن محتواها أو ممارسات الخصوصية أو أمانها.\n\nأي تعامل مع خدمات خارجية يتم بينك وبين الطرف الثالث فقط، وتخلى كانترا مسؤوليتها بالكامل عن أي أضرار ناتجة عن هذه التعاملات."],
      ["7. حدود المسؤولية", "بأقصى حد يسمح به القانون، لا تتحمل كانترا ومؤسسوها وموظفوها والجهات المرتبطة بها أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية أو تأديبية تنشأ عن استخدامك للمنصة.\n\nيشمل ذلك على سبيل المثال لا الحصر: فقدان البيانات، خسارة الأرباح، انقطاع الخدمة، الأخطاء في المحتوى، والأضرار الناتجة عن الوصول غير المصرح به إلى بياناتك أو تعديلها."],
      ["8. إخلاء المسؤولية عن الضمانات", "تُقدم المنصة وجميع المحتويات المتاحة من خلالها \"كما هي\" و\"كما تتوفر\" دون أي ضمانات من أي نوع، سواء كانت صريحة أو ضمنية.\n\nلا تضمن كانترا أن المنصة ستكون خالية من الانقطاعات أو الأخطاء أو الفيروسات أو المكونات الضارة الأخرى. تخلوا كانترا صراحةً من جميع الضمانات، بما في ذلك الضمانات الضمنية المتعلقة بالقابلية للتسويق والملاءمة لغرض معين وعدم التعدي."],
      ["9. حماية البيانات", "تتعامل كانترا مع البيانات الشخصية وفق سياسة الخصوصية المعتمدة ووفقًا لأنظمة حماية البيانات الشخصية المعمول بها، بما في ذلك قانون حماية البيانات الشخصية المصري (القانون رقم 151 لسنة 2020).\n\nيُرجى مراجعة سياسة الخصوصية للحصول على معلومات مفصلة حول كيفية جمع بياناتك واستخدامها وتخزينها وحمايتها."],
      ["10. تسوية النزاعات والقانون الحاكم", "تخضع هذه الشروط وأي نزاع متعلق باستخدام المنصة للأنظمة المعمول بها في جمهورية مصر العربية.\n\nيسعى الطرفان أولاً إلى حل أي نزاع وديًا من خلال مفاوضات بحسن نية. إذا تعذر حل النزاع خلال 30 يومًا، يُحال إلى الجهات القضائية المختصة في القاهرة، جمهورية مصر العربية، والتي تنفرد بالاختصاص القضائي."],
      ["11. التواصل القانوني", `للاستفسارات أو الطلبات القانونية، يُرجى التواصل عبر:\n\nlegal@${rootDomain}\n\nيجب إرسال جميع المراسلات القانونية كتابيًا إلى العنوان المسجل للشركة.`],
    ] as [string, string][],
  };
}

export default function LegalPage({ locale, content }: { locale: string; content?: MarketingLegalPageContent }) {
  if (content) return <CmsLegalPage content={content} />;
  const c = locale === "ar" ? ar() : en();

  return (
    <LegalArticle eyebrow={c.eyebrow} title={c.title} updated={c.updated}>
      <LegalBlock title={c.company}>
        <p>{c.companyBody}</p>
        <ul className="list-inside list-disc space-y-1">
          <li>{c.headquarters}</li>
          <li>{c.email}</li>
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
