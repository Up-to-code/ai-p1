import type { ReactNode } from "react";
import { LegalArticle, LegalBlock } from "@/components/design-system";
import { brandDomainUrl } from "@qentrah/brand-identity";

function en() {
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "Policy", title: "Privacy Policy", updated: "Last updated: June 28, 2026",
    blocks: [
      ["1. Introduction", "This Privacy Policy explains how Qentrah Workspace collects, uses, discloses, and protects your personal data when you use the platform, visit our website, or communicate with us.\n\nBy using the platform, you acknowledge that you have read and understood this policy. If you do not agree with any part of this policy, you should stop using the platform immediately."],
      ["2. Information We Collect", "We collect the following categories of information:\n\nInformation you provide directly — name, email address, phone number, organization name, commercial registration details, job title, profile photo, and any other information you submit during onboarding or while using the platform.\n\nWorkspace data — projects, tasks, assets, client information, documents, messages, tags, statuses, financial data, and any other operational data you or your team enter into the platform.\n\nTechnical data — IP address, browser type and version, device type, operating system, referral URLs, and usage logs including pages visited, features used, and time spent on the platform.\n\nCommunication data — records of correspondence when you contact support, submit inquiries, or participate in surveys."],
      ["3. How We Use Your Information", "We use your information for the following purposes:\n\n- To create and manage your account and workspace\n- To operate, maintain, and improve the platform and its features\n- To synchronize data across devices, teams, and authorized integrations\n- To provide technical and operational support\n- To send service-related communications, updates, and alerts\n- To detect, prevent, and address security incidents, fraud, and abuse\n- To comply with applicable legal and regulatory obligations\n- To analyze usage patterns to improve user experience and platform performance"],
      ["4. Data Sharing & Disclosure", "We do not sell your personal data. We never have and never will.\n\nWe may share your data only in the following circumstances:\n\n- With authorized team members and users within your workspace, according to the permissions you configure\n- With third-party service providers who assist in operating the platform (e.g., cloud hosting, data storage, email delivery), under strict contractual obligations to protect your data\n- With integrated services and tools that you explicitly authorize and connect to your workspace\n- When required by law, regulation, legal process, or governmental request\n- To enforce our Terms of Service, protect our rights, property, or safety, or the rights, property, or safety of others\n\nIn the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. You will be notified of any such change."],
      ["5. Data Security", "We implement reasonable technical and organizational security measures to protect your data, including:\n\n- Access controls and role-based permissions\n- Encryption in transit and at rest\n- Audit logging of key activities\n- Regular security assessments\n- Secure integration handling\n\nHowever, no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your data."],
      ["6. Data Retention", "We retain your personal data for as long as your account is active, as needed to provide you with the platform services, or as required by applicable law.\n\nWhen data is no longer required, we will delete or anonymize it in accordance with our data management procedures. You may request deletion of your data at any time, subject to legal retention requirements."],
      ["7. Your Rights", "Depending on applicable law, you may have the following rights regarding your personal data:\n\n- Right to access — request a copy of the data we hold about you\n- Right to rectification — request correction of inaccurate or incomplete data\n- Right to deletion — request deletion of your data when it is no longer needed\n- Right to restrict processing — request limitation of how we use your data\n- Right to data portability — request transfer of your data to another service\n- Right to withdraw consent — withdraw consent at any time where processing is based on consent\n\nTo exercise any of these rights, please contact us at the email address below. We will respond within the timeframe required by applicable law."],
      ["8. Cookies & Similar Technologies", "We may use cookies, web beacons, and similar technologies to enhance your experience, analyze usage, and remember preferences.\n\nCookies are small text files stored on your device. You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of the platform.\n\nWe may also use analytics services that collect anonymous usage data to help us improve the platform."],
      ["9. Children's Privacy", "The platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal data, we will take steps to delete it promptly."],
      ["10. International Data Transfers", "Your data may be stored and processed in servers located outside your country of residence. We take appropriate safeguards to ensure your data is protected in accordance with this policy and applicable law when transferred internationally."],
      ["11. Changes to This Policy", "We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or operational needs.\n\nMaterial changes will be notified by posting the updated policy on this page with an updated date. We encourage you to review this page periodically. Your continued use of the platform after changes constitutes acceptance of the updated policy."],
    ] as [string, string][],
    contactTitle: "12. Contact Us",
    contact: "If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:",
    email: `privacy@${rootDomain}`,
  };
}

function ar() {
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "سياسة", title: "سياسة الخصوصية", updated: "آخر تحديث: 28 يونيو 2026",
    blocks: [
      ["1. المقدمة", "توضح سياسة الخصوصية هذه كيفية قيام كانترا بجمع بياناتك الشخصية واستخدامها والإفصاح عنها وحمايتها عند استخدام المنصة أو التواصل معنا.\n\nباستخدامك للمنصة، فإنك تقر بأنك قرأت هذه السياسة وفهمتها. إذا كنت لا توافق على أي جزء من هذه السياسة، فيجب عليك التوقف عن استخدام المنصة فورًا."],
      ["2. المعلومات التي نجمعها", "قد نجمع الفئات التالية من المعلومات:\n\nالمعلومات التي تقدمها مباشرة — الاسم، البريد الإلكتروني، رقم الجوال، اسم الشركة أو الفريق، السجل التجاري، المسمى الوظيفي، الصورة الشخصية، وأي معلومات أخرى تقدمها أثناء التسجيل أو استخدام المنصة.\n\nبيانات مساحة العمل — المشاريع، المهام، الأصول، معلومات العملاء، المستندات، الرسائل، التصنيفات، الحالات، البيانات المالية، وأي بيانات تشغيلية أخرى يدخلها فريقك في المنصة.\n\nالبيانات التقنية — عنوان IP، نوع المتصفح والإصدار، نوع الجهاز، نظام التشغيل، روابط الإحالة، وسجلات الاستخدام تشمل الصفحات التي تمت زيارتها والخصائص المستخدمة والوقت الذي قضيته في المنصة.\n\nبيانات التواصل — سجلات المراسلات عند التواصل مع الدعم الفني أو تقديم استفسارات أو المشاركة في استبيانات."],
      ["3. كيف نستخدم معلوماتك", "نستخدم معلوماتك للأغراض التالية:\n\n- إنشاء وإدارة حسابك ومساحة العمل\n- تشغيل وصيانة وتحسين المنصة وخصائصها\n- مزامنة البيانات عبر الأجهزة والفرق والتكاملات المصرح بها\n- تقديم الدعم الفني والتشغيلي\n- إرسال الإشعارات والتحديثات والتنبيهات المتعلقة بالخدمة\n- كشف ومنع ومعالجة الحوادث الأمنية والاحتيال وإساءة الاستخدام\n- الامتثال للالتزامات القانونية والتنظيمية\n- تحليل أنماط الاستخدام لتحسين تجربة المستخدم وأداء المنصة"],
      ["4. مشاركة البيانات والإفصاح", "نحن لا نبيع بياناتك الشخصية. لم نبعها ولن نبيعها أبدًا.\n\nقد نشارك بياناتك فقط في الحالات التالية:\n\n- مع أعضاء الفريق المصرح لهم داخل مساحة العمل وفق الصلاحيات التي تحددها\n- مع مزودي الخدمات الخارجية الذين يساعدون في تشغيل المنصة بموجب التزامات تعاقدية صارمة لحماية بياناتك\n- مع خدمات التكامل التي تأذن بها وتدمجها مع مساحة العمل\n- عند الالتزام بالقانون أو اللوائح أو الإجراءات القانونية أو الطلبات الحكومية\n- لإنفاذ شروط الخدمة وحماية حقوقنا أو ممتلكاتنا أو سلامتنا\n\nفي حالة الاندماج أو الاستحواذ أو بيع الأصول، قد تُنقل بياناتك كجزء من تلك الصفقة. سيتم إخطارك بأي تغيير من هذا القبيل."],
      ["5. أمن البيانات", "نتخذ إجراءات أمنية تقنية وتنظيمية معقولة لحماية بياناتك، بما في ذلك:\n\n- ضوابط الوصول والصلاحيات القائمة على الأدوار\n- التشفير أثناء النقل وعند التخزين\n- تسجيل التدقيق للأنشطة الرئيسية\n- تقييمات أمنية منتظمة\n- التعامل الآمن مع التكاملات\n\nومع ذلك، لا توجد طريقة نقل أو تخزين آمنة بنسبة 100%. لا يمكننا ضمان الأمان المطلق لبياناتك."],
      ["6. الاحتفاظ بالبيانات", "نحتفظ ببياناتك الشخصية طالما كان حسابك نشطًا، أو حسب الحاجة لتقديم خدمات المنصة، أو كما تقتضي الأنظمة المعمول بها.\n\nعند عدم الحاجة إلى البيانات، سنقوم بحذفها أو إخفاء هويتها وفق إجراءات إدارة البيانات المعتمدة."],
      ["7. حقوق المستخدم", "بناءً على الأنظمة المعمول بها، قد تكون لديك الحقوق التالية:\n\n- حق الاطلاع — طلب نسخة من البيانات التي نحتفظ بها عنك\n- حق التصحيح — طلب تصحيح البيانات غير الدقيقة\n- حق الحذف — طلب حذف بياناتك عندما لا تعود هناك حاجة إليها\n- حق تقييد المعالجة — طلب الحد من كيفية استخدامنا لبياناتك\n- حق نقل البيانات — طلب نقل بياناتك إلى خدمة أخرى\n- حق سحب الموافقة — سحب الموافقة في أي وقت\n\nلممارسة أي من هذه الحقوق، يُرجى التواصل معنا عبر البريد الإلكتروني أدناه."],
      ["8. ملفات الارتباط والتقنيات المشابهة", "قد نستخدم ملفات الارتباط وإشارات الويب والتقنيات المشابهة لتحسين تجربتك وتحليل الاستخدام وحفظ التفضيلات.\n\nيمكنك التحكم في إعدادات ملفات الارتباط من خلال متصفحك. قد يؤثر تعطيلها على بعض وظائف المنصة."],
      ["9. خصوصية الأطفال", "المنصة غير موجهة للأفراد الذين تقل أعمارهم عن 18 عامًا. لا نجمع عن قصد بيانات شخصية من الأطفال."],
      ["10. نقل البيانات الدولي", "قد يتم تخزين بياناتك ومعالجتها في خوادم تقع خارج بلد إقامتك. نتخذ الضمانات المناسبة لضمان حماية بياناتك وفقًا لهذه السياسة والقانون المعمول به."],
      ["11. التحديثات على هذه السياسة", "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم الإخطار بالتغييرات الجوهرية من خلال نشر السياسة المحدثة على هذه الصفحة مع تاريخ محدث."],
    ] as [string, string][],
    contactTitle: "12. التواصل معنا",
    contact: "إذا كانت لديك أي أسئلة أو استفسارات، يرجى التواصل معنا عبر:",
    email: `privacy@${rootDomain}`,
  };
}

export default function PrivacyPage({ locale }: { locale: string }) {
  const c = locale === "ar" ? ar() : en();

  return (
    <LegalArticle eyebrow={c.eyebrow} title={c.title} updated={c.updated}>
      {c.blocks.map(([title, body]) => (
        <LegalBlock key={title} title={title}>
          <RichBlockBody body={body} />
        </LegalBlock>
      ))}
      <LegalBlock title={c.contactTitle}>
        <p>{c.contact}</p>
        <p>
          <a href={`mailto:${c.email}`} className="font-black text-[var(--q-accent)] hover:underline">
            {c.email}
          </a>
        </p>
      </LegalBlock>
    </LegalArticle>
  );
}

function RichBlockBody({ body }: { body: string }) {
  return (
    <>
      {body.split("\n\n").map((paragraph): ReactNode => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  );
}
