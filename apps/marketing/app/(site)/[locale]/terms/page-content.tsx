"use client";

import { useLocale } from "next-intl";

import { LegalArticle, LegalBlock } from "@/components/design-system";
import { brandDomainUrl } from "@qentrah/brand-identity";

function en() {
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "Terms",
    title: "Terms of Service",
    updated: "Last updated: June 28, 2026",
    blocks: [
      [
        "1. Acceptance of Terms",
        "By accessing or using the Qentrah platform, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.\n\nIf you do not agree to these terms, you must not access or use the platform.",
      ],
      [
        "2. Platform Description",
        "Qentrah provides a workspace platform for teams to manage projects, assets, clients, data, and integrations through a unified operational environment.\n\nThe platform is designed to improve operational efficiency, unify data, and streamline workflows. It is not a substitute for professional judgment, legal advice, or independent verification of information before making business or contractual decisions.",
      ],
      [
        "3. Account Registration & Security",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.\n\nYou must provide accurate, current, and complete information during registration. Fraudulent, misleading, or incomplete information may result in immediate suspension or termination of your account.\n\nYou must notify us immediately of any unauthorized use of your account or any other security breach. We are not liable for any loss or damage arising from your failure to protect your account.",
      ],
      [
        "4. User Responsibilities",
        "You agree to:\n\n- Use the platform in compliance with all applicable laws and regulations\n- Maintain accurate and up-to-date data within your workspace\n- Not use the platform for any unlawful, fraudulent, or harmful purpose\n- Not attempt to gain unauthorized access to any part of the platform\n- Not introduce malware, viruses, or other harmful code\n- Not scrape, mine, or extract data from the platform without authorization\n- Not interfere with or disrupt the integrity or performance of the platform\n\nYou are solely responsible for all content, data, and materials you submit or make available through the platform.",
      ],
      [
        "5. Data Accuracy",
        "Organizations and users are solely responsible for the accuracy, completeness, and legality of all data entered into the platform, including project data, asset information, client details, financial figures, documents, and any other operational data.\n\nThe company does not verify, endorse, or assume responsibility for user-submitted data. We are not liable for any decisions, actions, or losses resulting from inaccurate, incomplete, or outdated user-submitted information.",
      ],
      [
        "6. Fees, Payments & Refunds",
        "Certain features of the platform may require payment of fees. All fees are non-refundable except as expressly stated in your subscription agreement.\n\nWe reserve the right to change our pricing with reasonable notice. Continued use of the platform after pricing changes constitutes acceptance of the new fees.\n\nFree tier accounts may be limited in features, storage, or usage. We reserve the right to modify or discontinue free tier offerings at any time without notice.",
      ],
      [
        "7. Integrations & Third-Party Services",
        "The platform may allow you to connect with third-party services, tools, APIs, or partner platforms. Your use of any third-party service is governed by that third party's terms and policies.\n\nWe do not control, endorse, or assume responsibility for any third-party service, including its availability, security, privacy practices, or content. We are not liable for any loss, damage, or disruption caused by third-party services, even if they are integrated with the platform.\n\nWe reserve the right to suspend or disable any integration that violates our terms, misuses data, or poses a security risk.",
      ],
      [
        "8. Intellectual Property Rights",
        "The platform, including its software, design, interfaces, logos, trademarks, and all related intellectual property, is owned by the company or its licensors. All rights are reserved.\n\nThese terms do not grant you any ownership or license rights to the platform's intellectual property. You may not reproduce, modify, distribute, or create derivative works based on the platform without our prior written consent.",
      ],
      [
        "9. Your Content",
        "You retain ownership of all content and data you submit to the platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and process your content solely for the purpose of providing and improving the platform services.\n\nWe do not claim ownership of your data. We will not use your data for purposes unrelated to the platform without your consent.",
      ],
      [
        "10. Service Availability & Disclaimer of Warranties",
        "The platform is provided on an \"as is\" and \"as available\" basis without any warranties of any kind, either express or implied.\n\nWe do not guarantee that the platform will be uninterrupted, timely, secure, error-free, or free from viruses or other harmful components.\n\nWe expressly disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.\n\nWe may perform scheduled or emergency maintenance that temporarily affects availability. We will make reasonable efforts to notify you of planned downtime.",
      ],
      [
        "11. Limitation of Liability",
        "To the maximum extent permitted by applicable law, in no event shall the company, its founders, employees, agents, or affiliates be liable for:\n\n- Any indirect, incidental, special, consequential, or punitive damages\n- Loss of profits, revenue, data, or business opportunities\n- Service interruption or loss of functionality\n- Costs of procurement of substitute services\n- Damages arising from unauthorized access to or alteration of your data\n\nOur total liability for any claim arising from these terms or your use of the platform shall not exceed the amount you have paid us in the twelve (12) months preceding the claim.\n\nThis limitation of liability applies regardless of the legal theory on which the claim is based, whether in contract, tort, negligence, strict liability, or otherwise.",
      ],
      [
        "12. Indemnification",
        "You agree to indemnify, defend, and hold harmless the company, its founders, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from or related to:\n\n- Your use of the platform\n- Your violation of these terms\n- Your violation of any applicable law or regulation\n- Any content or data you submit to the platform\n- Any dispute between you and another user of the platform",
      ],
      [
        "13. Termination",
        "We reserve the right to suspend or terminate your account or access to the platform at any time, with or without cause, and with or without notice.\n\nGrounds for immediate termination include but are not limited to: violation of these terms, fraudulent activity, non-payment of fees, or conduct that could harm the platform or other users.\n\nUpon termination, your right to use the platform will immediately cease. We may delete your data after a reasonable period following termination, subject to legal retention requirements.\n\nYou may terminate your account at any time by contacting us. No refunds will be provided for partial subscription periods.",
      ],
      [
        "14. Force Majeure",
        "We shall not be liable for any failure or delay in performing our obligations under these terms if such failure or delay is caused by circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, civil unrest, government actions, pandemics, internet failures, power outages, or third-party service disruptions.",
      ],
      [
        "15. Governing Law & Dispute Resolution",
        "These terms shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt.\n\nAny dispute arising from or relating to these terms or your use of the platform shall first be attempted to be resolved through good-faith negotiations. If the dispute cannot be resolved within 30 days, it shall be submitted to the competent courts of Cairo, Arab Republic of Egypt, which shall have exclusive jurisdiction.",
      ],
      [
        "16. Changes to Terms",
        "We reserve the right to modify these terms at any time. Material changes will be notified by posting the updated terms on this page with an updated date.\n\nYour continued use of the platform after the effective date of any changes constitutes acceptance of the modified terms. If you do not agree to the modified terms, you must stop using the platform.",
      ],
      [
        "17. Severability",
        "If any provision of these terms is found to be unenforceable or invalid by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect, and the unenforceable provision shall be modified to the minimum extent necessary to make it enforceable.",
      ],
      [
        "18. Entire Agreement",
        "These terms, together with our Privacy Policy and any applicable subscription agreement, constitute the entire agreement between you and the company regarding your use of the platform, superseding any prior agreements or understandings.",
      ],
      [
        "19. Contact",
        `For questions about these terms, please contact us at:\n\nhello@${rootDomain}`,
      ],
    ],
  };
}

function ar() {
  const rootDomain = brandDomainUrl("root").replace("https://", "");
  return {
    eyebrow: "الشروط",
    title: "شروط الخدمة",
    updated: "آخر تحديث: 28 يونيو 2026",
    blocks: [
      [
        "1. قبول الشروط",
        "باستخدامك لمنصة كانترا أو الوصول إلى أي من خدماتها، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت تستخدم المنصة نيابة عن شركة أو مؤسسة، فإنك تقر بأن لديك الصلاحية النظامية لتمثيلها والالتزام بهذه الشروط نيابة عنها.\n\nإذا كنت لا توافق على هذه الشروط، فيجب عليك عدم استخدام المنصة.",
      ],
      [
        "2. وصف المنصة",
        "توفر كانترا مساحة عمل للفرق لإدارة المشاريع والأصول والعملاء والبيانات والتكاملات من خلال بيئة تشغيل موحدة.\n\nصُممت المنصة لتحسين كفاءة التشغيل وتوحيد البيانات وتبسيط سير العمل. لا تُعد بديلاً عن التحكم المهني أو الاستشارات القانونية أو التحقق المستقل من المعلومات قبل اتخاذ القرارات التجارية أو التعاقدية.",
      ],
      [
        "3. التسجيل وأمن الحساب",
        "أنت مسؤول عن الحفاظ على سرية بيانات الدخول إلى حسابك وعن جميع الأنشطة التي تتم من خلاله.\n\nيجب عليك تقديم معلومات دقيقة وحالية وكاملة أثناء التسجيل. أي معلومات احتيالية أو مضللة أو غير كاملة قد تؤدي إلى تعليق أو إنهاء حسابك فورًا.\n\nيجب عليك إبلاغنا فورًا عن أي استخدام غير مصرح به لحسابك أو أي خرق أمني آخر. نحن غير مسؤولين عن أي خسارة أو ضرر ناتج عن فشلك في حماية حسابك.",
      ],
      [
        "4. مسؤوليات المستخدم",
        "تتعهد بما يلي:\n\n- استخدام المنصة وفقًا لجميع القوانين واللوائح المعمول بها\n- الحفاظ على بيانات دقيقة ومحدثة داخل مساحة العمل\n- عدم استخدام المنصة لأي غرض غير قانوني أو احتيالي أو ضار\n- عدم محاولة الوصول غير المصرح به إلى أي جزء من المنصة\n- عدم إدخال برمجيات خبيثة أو فيروسات أو أي تعليمات برمجية ضارة\n- عدم استخراج أو تعدين البيانات من المنصة دون إذن\n- عدم التدخل في تشغيل المنصة أو التأثير على أدائها وسلامتها\n\nأنت وحدك المسؤول عن جميع المحتويات والبيانات والمواد التي تقدمها أو تنشرها من خلال المنصة.",
      ],
      [
        "5. دقة البيانات",
        "تتحمل المؤسسات والمستخدمون المسؤولية الكاملة عن دقة واكتمال وقانونية جميع البيانات المدخلة في المنصة، بما في ذلك بيانات المشاريع والأصول والعملاء والأرقام المالية والمستندات وأي بيانات تشغيلية أخرى.\n\nلا تتحقق الشركة من البيانات المدخلة من قبل المستخدمين ولا تؤيدها ولا تتحمل مسؤوليتها. نحن غير مسؤولين عن أي قرارات أو إجراءات أو خسائر ناتجة عن معلومات غير دقيقة أو غير كاملة أو قديمة قدمها المستخدم.",
      ],
      [
        "6. الرسوم والمدفوعات والاسترداد",
        "قد تتطلب بعض ميزات المنصة دفع رسوم. جميع الرسوم غير قابلة للاسترداد إلا إذا نُص صراحةً على خلاف ذلك في اتفاقية الاشتراك.\n\nنحتفظ بالحق في تغيير أسعارنا مع إشعار معقول. استمرار استخدام المنصة بعد تغيير الأسعار يعتبر قبولاً بالرسوم الجديدة.\n\nقد تكون حسابات الخطة المجانية محدودة في الميزات أو التخزين أو الاستخدام. نحتفظ بالحق في تعديل أو إيقاف عروض الخطة المجانية في أي وقت دون إشعار.",
      ],
      [
        "7. التكاملات والخدمات الخارجية",
        "قد تتيح المنصة الربط مع خدمات أو أدوات أو واجهات برمجية أو منصات شركاء خارجية. استخدامك لأي خدمة خارجية يخضع لشروط وسياسات ذلك الطرف الثالث.\n\nنحن لا نتحكم في أي خدمة خارجية ولا نؤيدها ولا نتحمل مسؤوليتها، بما في ذلك توفرها أو أمانها أو ممارسات الخصوصية أو محتواها. نحن غير مسؤولين عن أي خسارة أو ضرر أو انقطاع ناتج عن خدمات خارجية، حتى لو كانت مدمجة مع المنصة.\n\nنحتفظ بالحق في تعليق أو تعطيل أي تكامل ينتهك شروطنا أو يسيء استخدام البيانات أو يشكل خطرًا أمنيًا.",
      ],
      [
        "8. حقوق الملكية الفكرية",
        "المنصة بما في ذلك برمجياتها وتصاميمها وواجهاتها وشعاراتها وعلاماتها التجارية وجميع الملكية الفكرية ذات الصلة مملوكة للشركة أو المرخصين لها. جميع الحقوق محفوظة.\n\nلا تمنحك هذه الشروط أي ملكية أو ترخيص لحقوق الملكية الفكرية للمنصة. لا يجوز لك نسخ أو تعديل أو توزيع أو إنشاء أعمال مشتقة بناءً على المنصة دون موافقتنا الخطية المسبقة.",
      ],
      [
        "9. المحتوى الخاص بك",
        "تحتفظ بملكية جميع المحتويات والبيانات التي تقدمها للمنصة. بتقديم المحتوى، تمنحنا ترخيصًا عالميًا غير حصري وخالي من الحقوق لاستخدام محتواك وتخزينه وعرضه ومعالجته لغرض توفير خدمات المنصة وتحسينها فقط.\n\nنحن لا ندعي ملكية بياناتك. لن نستخدم بياناتك لأغراض لا تتعلق بالمنصة دون موافقتك.",
      ],
      [
        "10. توفر الخدمة وإخلاء المسؤولية عن الضمانات",
        "تُقدم المنصة \"كما هي\" و\"كما تتوفر\" دون أي ضمانات من أي نوع، سواء كانت صريحة أو ضمنية.\n\nنحن لا نضمن أن المنصة ستكون خالية من الانقطاعات أو التأخير أو الأخطاء أو الفيروسات أو المكونات الضارة الأخرى.\n\nنخلوا صراحةً من جميع الضمانات، بما في ذلك على سبيل المثال لا الحصر الضمانات الضمنية المتعلقة بالقابلية للتسويق والملاءمة لغرض معين وعدم التعدي.\n\nقد نقوم بأعمال صيانة مجدولة أو طارئة تؤثر مؤقتًا على توفر الخدمة. سنبذل جهودًا معقولة لإخطارك بفترات التوقف المخطط لها.",
      ],
      [
        "11. حدود المسؤولية",
        "بأقصى حد يسمح به القانون، لا تتحمل الشركة أو مؤسسوها أو موظفوها أو وكلاؤها أو الجهات المرتبطة بها تحت أي ظرف مسؤولية:\n\n- أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو تأديبية\n- فقدان الأرباح أو الإيرادات أو البيانات أو فرص العمل\n- انقطاع الخدمة أو فقدان الوظائف\n- تكاليف شراء خدمات بديلة\n- الأضرار الناشئة عن الوصول غير المصرح به إلى بياناتك أو تعديلها\n\nلا تتجاوز مسؤوليتنا الإجمالية عن أي مطالبة تنشأ عن هذه الشروط أو استخدامك للمنصة المبلغ الذي دفعته لنا في الاثني عشر (12) شهرًا السابقة للمطالبة.\n\nينطبق هذا الحد من المسؤولية بغض النظر عن الأساس القانوني الذي تستند إليه المطالبة، سواء في العقد أو التقصير أو الإهمال أو المسؤولية الصارمة أو غير ذلك.",
      ],
      [
        "12. التعويض",
        "توافق على تعويض الشركة ومؤسسيها وموظفيها ووكلائها والجهات المرتبطة بها والدفاع عنها وحمايتها من أي وجميع المطالبات والمسؤوليات والأضرار والخسائر والتكاليف والمصروفات (بما في ذلك أتعاب المحاماة المعقولة) الناشئة عن أو المتعلقة بـ:\n\n- استخدامك للمنصة\n- انتهاكك لهذه الشروط\n- انتهاكك لأي قانون أو لائحة معمول بها\n- أي محتوى أو بيانات تقدمها للمنصة\n- أي نزاع بينك وبين مستخدم آخر للمنصة",
      ],
      [
        "13. إنهاء الاستخدام",
        "نحتفظ بالحق في تعليق أو إنهاء حسابك أو وصولك إلى المنصة في أي وقت، مع أو بدون سبب، ومع أو بدون إشعار.\n\nتشمل أسباب الإنهاء الفوري على سبيل المثال لا الحصر: انتهاك هذه الشروط، النشاط الاحتيالي، عدم دفع الرسوم، أو سلوك قد يضر بالمنصة أو المستخدمين الآخرين.\n\nعند الإنهاء، سينتهي حقك في استخدام المنصة فورًا. قد نقوم بحذف بياناتك بعد فترة معقولة من الإنهاء، مع مراعاة متطلبات الاحتفاظ القانونية.\n\nيمكنك إنهاء حسابك في أي وقت بالتواصل معنا. لن يتم تقديم أي استرداد لفترات الاشتراك الجزئية.",
      ],
      [
        "14. القوة القاهرة",
        "لا نكون مسؤولين عن أي فشل أو تأخير في أداء التزاماتنا بموجب هذه الشروط إذا كان هذا الفشل أو التأخير ناتجًا عن ظروف خارجة عن سيطرتنا المعقولة، بما في ذلك على سبيل المثال لا الحصر الكوارث الطبيعية والحروب والإرهاب والاضطرابات المدنية والإجراءات الحكومية والأوبئة وانقطاعات الإنترنت وانقطاع التيار الكهربائي أو انقطاع خدمات الطرف الثالث.",
      ],
      [
        "15. القانون الحاكم وتسوية النزاعات",
        "تخضع هذه الشروط وتُفسر وفق الأنظمة المعمول بها في جمهورية مصر العربية.\n\nأي نزاع ينشأ عن أو يتعلق بهذه الشروط أو استخدامك للمنصة يتم أولاً محاولة حله من خلال مفاوضات بحسن نية. إذا تعذر حل النزاع خلال 30 يومًا، يُحال إلى المحاكم المختصة في القاهرة، جمهورية مصر العربية، والتي تنفرد بالاختصاص القضائي.",
      ],
      [
        "16. تعديل الشروط",
        "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم الإخطار بالتغييرات الجوهرية من خلال نشر الشروط المحدثة على هذه الصفحة مع تاريخ محدث.\n\nاستمرار استخدامك للمنصة بعد تاريخ سريان أي تغييرات يعتبر قبولاً بالشروط المعدلة. إذا كنت لا توافق على الشروط المعدلة، يجب عليك التوقف عن استخدام المنصة.",
      ],
      [
        "17. قابلية الانفصال",
        "إذا تبين أن أي حكم من هذه الشروط غير قابل للتنفيذ أو باطل من قبل محكمة مختصة، تبقى الأحكام الأخرى سارية المفعول، ويُعدل الحكم غير القابل للتنفيذ إلى الحد الأدنى اللازم لجعله قابلاً للتنفيذ.",
      ],
      [
        "18. الاتفاق الكامل",
        "تشكل هذه الشروط، إلى جانب سياسة الخصوصية وأي اتفاقية اشتراك سارية، الاتفاق الكامل بينك وبين الشركة فيما يتعلق باستخدامك للمنصة، لتحل محل أي اتفاقيات أو تفاهمات سابقة.",
      ],
      [
        "19. التواصل",
        `للاستفسارات حول هذه الشروط، يُرجى التواصل معنا عبر:\n\nhello@${rootDomain}`,
      ],
    ],
  };
}

export default function TermsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const c = isAr ? ar() : en();

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
