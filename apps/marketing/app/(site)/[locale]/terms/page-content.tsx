import { LegalArticle, LegalBlock } from "@/components/design-system";
import { brandDomainUrl } from "@qentrah/brand-identity";

function en() {
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "Terms", title: "Terms of Service", updated: "Last updated: June 28, 2026",
    blocks: [
      ["1. Acceptance of Terms", "By accessing or using the Qentrah platform, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.\n\nIf you do not agree to these terms, you must not access or use the platform."],
      ["2. Platform Description", "Qentrah provides a workspace platform for teams to manage projects, assets, clients, data, and integrations through a unified operational environment.\n\nThe platform is designed to improve operational efficiency, unify data, and streamline workflows. It is not a substitute for professional judgment, legal advice, or independent verification of information before making business or contractual decisions."],
      ["3. Account Registration & Security", "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.\n\nYou must provide accurate, current, and complete information during registration. Fraudulent, misleading, or incomplete information may result in immediate suspension or termination of your account.\n\nYou must notify us immediately of any unauthorized use of your account or any other security breach. We are not liable for any loss or damage arising from your failure to protect your account."],
      ["4. User Responsibilities", "You agree to:\n\n- Use the platform in compliance with all applicable laws and regulations\n- Maintain accurate and up-to-date data within your workspace\n- Not use the platform for any unlawful, fraudulent, or harmful purpose\n- Not attempt to gain unauthorized access to any part of the platform\n- Not introduce malware, viruses, or other harmful code\n- Not scrape, mine, or extract data from the platform without authorization\n- Not interfere with or disrupt the integrity or performance of the platform\n\nYou are solely responsible for all content, data, and materials you submit or make available through the platform."],
      ["5. Data Accuracy", "Organizations and users are solely responsible for the accuracy, completeness, and legality of all data entered into the platform.\n\nThe company does not verify, endorse, or assume responsibility for user-submitted data. We are not liable for any decisions, actions, or losses resulting from inaccurate, incomplete, or outdated user-submitted information."],
      ["6. Fees, Payments & Refunds", "Certain features of the platform may require payment of fees. All fees are non-refundable except as expressly stated in your subscription agreement.\n\nWe reserve the right to change our pricing with reasonable notice. Continued use of the platform after pricing changes constitutes acceptance of the new fees."],
      ["7. Integrations & Third-Party Services", "The platform may allow you to connect with third-party services, tools, APIs, or partner platforms. Your use of any third-party service is governed by that third party's terms and policies.\n\nWe do not control, endorse, or assume responsibility for any third-party service. We are not liable for any loss, damage, or disruption caused by third-party services, even if they are integrated with the platform."],
      ["8. Intellectual Property Rights", "The platform, including its software, design, interfaces, logos, trademarks, and all related intellectual property, is owned by the company or its licensors. All rights are reserved.\n\nThese terms do not grant you any ownership or license rights to the platform's intellectual property."],
      ["9. Your Content", "You retain ownership of all content and data you submit to the platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and process your content solely for the purpose of providing and improving the platform services."],
      ["10. Service Availability & Disclaimer of Warranties", "The platform is provided on an \"as is\" and \"as available\" basis without any warranties of any kind, either express or implied.\n\nWe do not guarantee that the platform will be uninterrupted, timely, secure, error-free, or free from viruses or other harmful components."],
      ["11. Limitation of Liability", "To the maximum extent permitted by applicable law, in no event shall the company, its founders, employees, agents, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages.\n\nOur total liability for any claim arising from these terms or your use of the platform shall not exceed the amount you have paid us in the twelve (12) months preceding the claim."],
      ["12. Indemnification", "You agree to indemnify, defend, and hold harmless the company, its founders, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from or related to your use of the platform or violation of these terms."],
      ["13. Termination", "We reserve the right to suspend or terminate your account or access to the platform at any time, with or without cause, and with or without notice.\n\nUpon termination, your right to use the platform will immediately cease. We may delete your data after a reasonable period following termination, subject to legal retention requirements."],
      ["14. Force Majeure", "We shall not be liable for any failure or delay in performing our obligations under these terms if such failure or delay is caused by circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, pandemics, internet failures, or power outages."],
      ["15. Governing Law & Dispute Resolution", "These terms shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt.\n\nAny dispute arising from or relating to these terms shall first be attempted to be resolved through good-faith negotiations. If unresolved within 30 days, it shall be submitted to the competent courts of Cairo, Arab Republic of Egypt."],
      ["16. Changes to Terms", "We reserve the right to modify these terms at any time. Material changes will be notified by posting the updated terms on this page with an updated date.\n\nYour continued use of the platform after the effective date of any changes constitutes acceptance of the modified terms."],
      ["17. Severability", "If any provision of these terms is found to be unenforceable or invalid by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect."],
      ["18. Entire Agreement", "These terms, together with our Privacy Policy and any applicable subscription agreement, constitute the entire agreement between you and the company regarding your use of the platform."],
      ["19. Contact", `For questions about these terms, please contact us at:\n\nhello@${rootDomain}`],
    ] as [string, string][],
  };
}

function ar() {
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "الشروط", title: "شروط الخدمة", updated: "آخر تحديث: 28 يونيو 2026",
    blocks: [
      ["1. قبول الشروط", "باستخدامك لمنصة كانترا أو الوصول إلى أي من خدماتها، فإنك توافق على الالتزام بشروط الخدمة هذه.\n\nإذا كنت لا توافق على هذه الشروط، فيجب عليك عدم استخدام المنصة."],
      ["2. وصف المنصة", "توفر كانترا مساحة عمل للفرق لإدارة المشاريع والأصول والعملاء والبيانات والتكاملات من خلال بيئة تشغيل موحدة.\n\nصُممت المنصة لتحسين كفاءة التشغيل وتوحيد البيانات وتبسيط سير العمل. لا تُعد بديلاً عن التحكم المهني أو الاستشارات القانونية."],
      ["3. التسجيل وأمن الحساب", "أنت مسؤول عن الحفاظ على سرية بيانات الدخول إلى حسابك وعن جميع الأنشطة التي تتم من خلاله.\n\nيجب عليك تقديم معلومات دقيقة وحالية وكاملة أثناء التسجيل. أي معلومات احتيالية أو مضللة قد تؤدي إلى تعليق حسابك أو إنهائه فورًا."],
      ["4. مسؤوليات المستخدم", "تتعهد بما يلي:\n\n- استخدام المنصة وفقًا لجميع القوانين واللوائح المعمول بها\n- الحفاظ على بيانات دقيقة ومحدثة داخل مساحة العمل\n- عدم استخدام المنصة لأي غرض غير قانوني أو احتيالي أو ضار\n- عدم محاولة الوصول غير المصرح به إلى أي جزء من المنصة\n- عدم إدخال برمجيات خبيثة أو فيروسات\n- عدم التدخل في تشغيل المنصة أو التأثير على أدائها"],
      ["5. دقة البيانات", "تتحمل المؤسسات والمستخدمون المسؤولية الكاملة عن دقة واكتمال وقانونية جميع البيانات المدخلة في المنصة.\n\nلا تتحقق الشركة من البيانات المدخلة من قبل المستخدمين ولا تتحمل مسؤوليتها."],
      ["6. الرسوم والمدفوعات والاسترداد", "قد تتطلب بعض ميزات المنصة دفع رسوم. جميع الرسوم غير قابلة للاسترداد إلا إذا نُص صراحةً على خلاف ذلك في اتفاقية الاشتراك.\n\nنحتفظ بالحق في تغيير أسعارنا مع إشعار معقول."],
      ["7. التكاملات والخدمات الخارجية", "قد تتيح المنصة الربط مع خدمات أو أدوات أو واجهات برمجية خارجية. استخدامك لأي خدمة خارجية يخضع لشروط وسياسات ذلك الطرف الثالث.\n\nنحن لا نتحكم في أي خدمة خارجية ولا نتحمل مسؤوليتها."],
      ["8. حقوق الملكية الفكرية", "المنصة بما في ذلك برمجياتها وتصاميمها وواجهاتها وشعاراتها وعلاماتها التجارية مملوكة للشركة أو المرخصين لها. جميع الحقوق محفوظة."],
      ["9. المحتوى الخاص بك", "تحتفظ بملكية جميع المحتويات والبيانات التي تقدمها للمنصة. بتقديم المحتوى، تمنحنا ترخيصًا لاستخدامه لغرض توفير خدمات المنصة وتحسينها فقط."],
      ["10. توفر الخدمة وإخلاء المسؤولية عن الضمانات", "تُقدم المنصة \"كما هي\" و\"كما تتوفر\" دون أي ضمانات من أي نوع.\n\nنحن لا نضمن أن المنصة ستكون خالية من الانقطاعات أو الأخطاء أو الفيروسات."],
      ["11. حدود المسؤولية", "بأقصى حد يسمح به القانون، لا تتحمل الشركة أو مؤسسوها أو موظفوها تحت أي ظرف مسؤولية أي أضرار غير مباشرة أو عرضية أو تبعية.\n\nلا تتجاوز مسؤوليتنا الإجمالية المبلغ الذي دفعته لنا في الاثني عشر (12) شهرًا السابقة للمطالبة."],
      ["12. التعويض", "توافق على تعويض الشركة ومؤسسيها وموظفيها والدفاع عنهم من أي مطالبات أو أضرار تنشأ عن استخدامك للمنصة أو انتهاكك لهذه الشروط."],
      ["13. إنهاء الاستخدام", "نحتفظ بالحق في تعليق أو إنهاء حسابك في أي وقت، مع أو بدون سبب.\n\nعند الإنهاء، سينتهي حقك في استخدام المنصة فورًا."],
      ["14. القوة القاهرة", "لا نكون مسؤولين عن أي فشل أو تأخير ناتج عن ظروف خارجة عن سيطرتنا المعقولة، بما في ذلك الكوارث الطبيعية والحروب والأوبئة وانقطاعات الإنترنت."],
      ["15. القانون الحاكم وتسوية النزاعات", "تخضع هذه الشروط للأنظمة المعمول بها في جمهورية مصر العربية.\n\nأي نزاع يُحال إلى المحاكم المختصة في القاهرة، جمهورية مصر العربية، بعد محاولة التسوية الودية خلال 30 يومًا."],
      ["16. تعديل الشروط", "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك للمنصة بعد تاريخ سريان أي تغييرات يعتبر قبولاً بالشروط المعدلة."],
      ["17. قابلية الانفصال", "إذا تبين أن أي حكم من هذه الشروط غير قابل للتنفيذ، تبقى الأحكام الأخرى سارية المفعول."],
      ["18. الاتفاق الكامل", "تشكل هذه الشروط، إلى جانب سياسة الخصوصية وأي اتفاقية اشتراك سارية، الاتفاق الكامل بينك وبين الشركة."],
      ["19. التواصل", `للاستفسارات حول هذه الشروط، يُرجى التواصل معنا عبر:\n\nhello@${rootDomain}`],
    ] as [string, string][],
  };
}

export default function TermsPage({ locale }: { locale: string }) {
  const c = locale === "ar" ? ar() : en();

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
