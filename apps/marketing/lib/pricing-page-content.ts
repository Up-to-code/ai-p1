import {
  getGlobalPlan,
  getMarketPricing,
  type SubscriptionPlanId,
} from "@qentrah/domain-contracts";

import type { Locale } from "./content";

export type PricingPlanEditorial = {
  id: SubscriptionPlanId;
  name: string;
  description: string;
  badge: string;
  cta: string;
  sectionHeader: string;
  moreLabel: string;
};

export type PricingFeatureSection = {
  category: string;
  rows: Array<{ key: PricingFeatureKey; label: string }>;
};

export type PricingFeatureKey =
  | "members"
  | "projects"
  | "storage"
  | "aiCredits"
  | "guests"
  | "webhooks"
  | "automations"
  | "apiCalls"
  | "agentLinks"
  | "customRoles"
  | "sso"
  | "auditLogs"
  | "support";

export type PricingPageContent = {
  eyebrow: string;
  headline: [string, string, string, string];
  subtitle: string;
  guarantee: string;
  monthlyLabel: string;
  yearlyLabel: string;
  plansAriaLabel: string;
  compareNote: string;
  monthlyUnitLabel: string;
  yearlyUnitLabel: string;
  customPriceLabel: string;
  plans: PricingPlanEditorial[];
  featureComparison: {
    heading: string;
    ariaLabel: string;
    sections: PricingFeatureSection[];
  };
  platformComparison: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    labels: string[];
    sections: Array<{ label: string; rows: string[][] }>;
    note: string;
  };
  faq: {
    heading: [string, string];
    subtitleBefore: string;
    contactLabel: string;
    subtitleAfter: string;
    loadMoreLabel: string;
    items: Array<[string, string]>;
  };
};

const planIds: SubscriptionPlanId[] = ["free", "good", "better", "custom"];

const commonFeatureKeys: Array<[PricingFeatureKey, string, string, string]> = [
  ["members", "Team members", "أعضاء الفريق", "Membres de l’équipe"],
  ["projects", "Projects", "المشاريع", "Projets"],
  ["storage", "Storage", "التخزين", "Stockage"],
  ["aiCredits", "Included AI credits / month", "أرصدة الذكاء الشهرية", "Crédits IA inclus / mois"],
  ["guests", "Guest access", "وصول الضيوف", "Accès invités"],
  ["webhooks", "Webhooks", "خطافات الويب", "Webhooks"],
  ["automations", "Automations / month", "الأتمتة شهرياً", "Automatisations / mois"],
  ["apiCalls", "API calls / month", "استدعاءات API شهرياً", "Appels API / mois"],
  ["agentLinks", "Agent links", "روابط الوكلاء", "Liens d’agents"],
  ["customRoles", "Custom roles", "الأدوار المخصصة", "Rôles personnalisés"],
  ["sso", "Single sign-on", "تسجيل الدخول الموحد", "Authentification unique"],
  ["auditLogs", "Audit history", "سجل التدقيق", "Historique d’audit"],
  ["support", "Support", "الدعم", "Support"],
];

function featureSections(locale: Locale): PricingFeatureSection[] {
  const labelIndex = locale === "ar" ? 2 : locale === "fr" ? 3 : 1;
  const row = (key: PricingFeatureKey) => {
    const item = commonFeatureKeys.find(([candidate]) => candidate === key)!;
    return { key, label: item[labelIndex] };
  };
  return [
    { category: locale === "ar" ? "الأساسيات" : locale === "fr" ? "ESSENTIEL" : "CORE", rows: [row("members"), row("projects"), row("storage"), row("aiCredits")] },
    { category: locale === "ar" ? "التشغيل" : locale === "fr" ? "EXÉCUTION" : "EXECUTION", rows: [row("guests"), row("webhooks"), row("automations"), row("apiCalls"), row("agentLinks")] },
    { category: locale === "ar" ? "الأمان والدعم" : locale === "fr" ? "SÉCURITÉ ET SUPPORT" : "SECURITY & SUPPORT", rows: [row("customRoles"), row("sso"), row("auditLogs"), row("support")] },
  ];
}

const planCopy: Record<Locale, PricingPlanEditorial[]> = {
  en: [
    { id: "free", name: "Free", description: "For individuals and small teams starting together", badge: "", cta: "Start free", sectionHeader: "INCLUDED ON FREE:", moreLabel: "Core collaboration included" },
    { id: "good", name: "Unlimited", description: "For teams that need unlimited core work and AI", badge: "", cta: "Get Unlimited", sectionHeader: "EVERYTHING IN FREE, PLUS:", moreLabel: "Additional seats billed at the plan rate" },
    { id: "better", name: "Business", description: "For professional teams with advanced operations", badge: "Popular", cta: "Get Business", sectionHeader: "EVERYTHING IN UNLIMITED, PLUS:", moreLabel: "Priority support included" },
    { id: "custom", name: "Enterprise", description: "For organizations requiring contract controls", badge: "", cta: "Contact sales", sectionHeader: "CONTRACT-DEFINED ACCESS:", moreLabel: "Custom quotas and dedicated support" },
  ],
  ar: [
    { id: "free", name: "مجاني", description: "للأفراد والفرق الصغيرة عند البداية", badge: "", cta: "ابدأ مجاناً", sectionHeader: "يتضمن المجاني:", moreLabel: "تعاون أساسي متاح" },
    { id: "good", name: "غير محدود", description: "للفرق التي تحتاج إلى عمل أساسي غير محدود وذكاء", badge: "", cta: "اختر غير محدود", sectionHeader: "كل ما في المجاني، بالإضافة إلى:", moreLabel: "تُفوتر المقاعد الإضافية بسعر الخطة" },
    { id: "better", name: "الأعمال", description: "للفرق المحترفة ذات العمليات المتقدمة", badge: "الأكثر شيوعاً", cta: "اختر الأعمال", sectionHeader: "كل ما في غير محدود، بالإضافة إلى:", moreLabel: "دعم ذو أولوية" },
    { id: "custom", name: "المؤسسات", description: "للمنظمات التي تحتاج إلى ضوابط تعاقدية", badge: "", cta: "تواصل مع المبيعات", sectionHeader: "وصول محدد بالعقد:", moreLabel: "حصص مخصصة ودعم مكرس" },
  ],
  fr: [
    { id: "free", name: "Gratuit", description: "Pour les personnes et petites équipes qui démarrent", badge: "", cta: "Commencer gratuitement", sectionHeader: "INCLUS GRATUITEMENT :", moreLabel: "Collaboration essentielle incluse" },
    { id: "good", name: "Illimité", description: "Pour les équipes qui veulent le cœur illimité et l’IA", badge: "", cta: "Choisir Illimité", sectionHeader: "TOUT GRATUIT, PLUS :", moreLabel: "Sièges supplémentaires facturés au tarif du forfait" },
    { id: "better", name: "Business", description: "Pour les équipes professionnelles aux opérations avancées", badge: "Populaire", cta: "Choisir Business", sectionHeader: "TOUT ILLIMITÉ, PLUS :", moreLabel: "Support prioritaire inclus" },
    { id: "custom", name: "Entreprise", description: "Pour les organisations avec exigences contractuelles", badge: "", cta: "Contacter l’équipe", sectionHeader: "ACCÈS DÉFINI PAR CONTRAT :", moreLabel: "Quotas personnalisés et support dédié" },
  ],
};

const comparisonRows = {
  en: [
    { label: "OPERATING MODEL", rows: [["Primary center of gravity", "Client work and delivery", "Configurable work", "Goals and cross-functional work", "Docs and databases"], ["Projects and tasks", "Connected to clients", "Native", "Native", "Native"], ["Documents alongside work", "Project-linked", "Docs", "Project updates", "Native"], ["Client record", "Native workspace resource", "Configured", "Configured", "Databases"]] },
    { label: "CONTROL AND EXECUTION", rows: [["Access model", "Organization · space · project", "Workspace setup", "Project setup", "Database setup"], ["Agent and tool scope", "Scoped MCP tools", "Workspace capabilities", "Work management capabilities", "Page and database context"], ["Work handoff context", "Client, project, task, and document", "Configured relationships", "Projects and tasks", "Relations and databases"]] },
    { label: "AI WORK", rows: [["AI assistance", "Scoped workspace actions", "ClickUp Brain", "Asana AI", "Notion AI"], ["Context supplied to AI", "Projects, clients, documents", "Workspace content", "Work graph", "Pages and databases"]] },
  ],
  ar: [
    { label: "نموذج التشغيل", rows: [["نقطة التركيز الرئيسية", "عمل العميل والتسليم", "عمل قابل للتخصيص", "الأهداف والعمل عبر الفرق", "المستندات وقواعد البيانات"], ["المشاريع والمهام", "مرتبطة بالعملاء", "مدمجة", "مدمجة", "مدمجة"], ["المستندات بجانب العمل", "مرتبطة بالمشروع", "مستندات", "تحديثات المشاريع", "مدمجة"], ["سجل العميل", "مورد أصيل لمساحة العمل", "إعداد مخصص", "إعداد مخصص", "قواعد بيانات"]] },
    { label: "التحكم والتنفيذ", rows: [["نموذج الوصول", "المؤسسة · المساحة · المشروع", "إعداد مساحة العمل", "إعداد المشروع", "إعداد قاعدة البيانات"], ["نطاق الوكلاء والأدوات", "أدوات MCP ضمن النطاق", "قدرات مساحة العمل", "قدرات إدارة العمل", "سياق الصفحة وقاعدة البيانات"], ["سياق تسليم العمل", "العميل والمشروع والمهمة والمستند", "علاقات مخصصة", "المشاريع والمهام", "العلاقات وقواعد البيانات"]] },
    { label: "العمل بالذكاء الاصطناعي", rows: [["المساعدة بالذكاء الاصطناعي", "إجراءات مساحة عمل ضمن النطاق", "ClickUp Brain", "Asana AI", "Notion AI"], ["السياق المقدم للذكاء", "مشاريع وعملاء ومستندات", "محتوى مساحة العمل", "رسم العمل", "الصفحات وقواعد البيانات"]] },
  ],
  fr: [
    { label: "MODÈLE OPÉRATIONNEL", rows: [["Centre de gravité", "Travail client et livraison", "Travail configurable", "Objectifs transverses", "Documents et bases"], ["Projets et tâches", "Reliés aux clients", "Natif", "Natif", "Natif"], ["Documents avec le travail", "Reliés au projet", "Docs", "Mises à jour", "Natif"], ["Fiche client", "Ressource native", "Configurée", "Configurée", "Bases de données"]] },
    { label: "CONTRÔLE ET EXÉCUTION", rows: [["Modèle d’accès", "Organisation · espace · projet", "Configuration espace", "Configuration projet", "Configuration base"], ["Périmètre agents et outils", "Outils MCP cadrés", "Capacités espace", "Capacités de travail", "Contexte pages et bases"], ["Contexte de relais", "Client, projet, tâche et document", "Relations configurées", "Projets et tâches", "Relations et bases"]] },
    { label: "TRAVAIL IA", rows: [["Assistance IA", "Actions cadrées", "ClickUp Brain", "Asana AI", "Notion AI"], ["Contexte fourni à l’IA", "Projets, clients, documents", "Contenu espace", "Graphe de travail", "Pages et bases"]] },
  ],
};

const faqItems: Record<Locale, Array<[string, string]>> = {
  en: [["Can I upgrade only myself?", "Plans apply to the organization. Unlimited and Business include three members, with additional seats billed at the same cycle rate."], ["What payment methods do you accept?", "DodoPayments checkout accepts supported cards. Enterprise payment terms are agreed in the contract."], ["How does cancellation work?", "Cancellation applies at period end. Existing data remains available if the organization later falls back to Free."], ["What happens after a failed renewal?", "Paid access receives a seven-day grace period before Free entitlements apply."], ["Can we purchase additional AI credits?", "Active Unlimited and Business organizations can purchase fixed packs or a custom whole-dollar amount."], ["Do purchased AI credits expire?", "Purchased credits never expire and are used after the monthly subscription allowance."]],
  ar: [["هل يمكنني ترقية نفسي فقط؟", "تطبق الخطط على المؤسسة. تشمل خطتا غير محدود والأعمال ثلاثة أعضاء، وتُفوتر المقاعد الإضافية بسعر الدورة نفسه."], ["ما طرق الدفع المقبولة؟", "يقبل دفع DodoPayments البطاقات المدعومة، بينما تُحدد شروط المؤسسات في العقد."], ["كيف يعمل الإلغاء؟", "يسري الإلغاء في نهاية الفترة، وتبقى البيانات متاحة إذا عادت المؤسسة إلى المجاني."], ["ماذا يحدث بعد فشل التجديد؟", "تحصل الخطة المدفوعة على مهلة سبعة أيام قبل تطبيق صلاحيات المجاني."], ["هل يمكن شراء أرصدة ذكاء إضافية؟", "يمكن للمؤسسات النشطة على غير محدود والأعمال شراء باقات ثابتة أو مبلغ مخصص بالدولار الكامل."], ["هل تنتهي الأرصدة المشتراة؟", "لا تنتهي الأرصدة المشتراة، وتُستهلك بعد الرصيد الشهري المشمول."]],
  fr: [["Puis-je mettre à niveau uniquement mon compte ?", "Les forfaits s’appliquent à l’organisation. Illimité et Business incluent trois membres, puis les sièges supplémentaires sont facturés au même cycle."], ["Quels moyens de paiement acceptez-vous ?", "Le paiement DodoPayments accepte les cartes prises en charge. Les conditions Entreprise sont définies au contrat."], ["Comment fonctionne l’annulation ?", "L’annulation prend effet en fin de période. Les données restent accessibles si l’organisation repasse ensuite au forfait Gratuit."], ["Que se passe-t-il après un renouvellement échoué ?", "L’accès payant bénéficie d’un délai de grâce de sept jours avant l’application des droits Gratuit."], ["Peut-on acheter des crédits IA supplémentaires ?", "Les organisations actives Illimité et Business peuvent acheter des packs fixes ou un montant personnalisé en dollars entiers."], ["Les crédits achetés expirent-ils ?", "Les crédits achetés n’expirent jamais et sont consommés après l’allocation mensuelle."]],
};

const pageCopy: Record<Locale, Omit<PricingPageContent, "plans" | "featureComparison">> = {
  en: { eyebrow: "PRICING", headline: ["One workspace for ", "client", "work and ", "delivery."], subtitle: "Choose a plan for your team, then keep clients, projects, documents, and delivery connected in one workspace.", guarantee: "Verified checkout · cancel at period end", monthlyLabel: "Monthly", yearlyLabel: "Yearly", plansAriaLabel: "Pricing plans", compareNote: "Compare every entitlement and support option below.", monthlyUnitLabel: "Per additional seat / month", yearlyUnitLabel: "Per additional seat / year, billed yearly", customPriceLabel: "Contract pricing", platformComparison: { eyebrow: "PLATFORM COMPARISON", title: "Compare through the client-delivery lens.", description: "Qentrah connects the client record, opportunity, project, documents, and tasks behind a delivery—not simply a list of tasks.", button: "Compare platforms", labels: ["Capability", "Qentrah", "ClickUp", "Asana", "Notion"], sections: comparisonRows.en, note: "Product descriptions are condensed summaries. Check each vendor’s current documentation before purchasing." }, faq: { heading: ["Frequently asked ", "questions"], subtitleBefore: "Find answers here, or ", contactLabel: "contact us", subtitleAfter: " if you need help choosing a plan.", loadMoreLabel: "Load more", items: faqItems.en } },
  ar: { eyebrow: "التسعير", headline: ["مساحة عمل واحدة ", "لعمل العميل", "والتنفيذ ", "المترابط."], subtitle: "اختر الخطة المناسبة لفريقك، ثم حافظ على العملاء والمشاريع والمستندات والتنفيذ مترابطة في مساحة واحدة.", guarantee: "دفع موثّق · الإلغاء في نهاية الفترة", monthlyLabel: "شهري", yearlyLabel: "سنوي", plansAriaLabel: "خطط التسعير", compareNote: "قارن كل الصلاحيات وخيارات الدعم أدناه.", monthlyUnitLabel: "لكل مقعد إضافي / شهر", yearlyUnitLabel: "لكل مقعد إضافي / سنة، تُفوتر سنوياً", customPriceLabel: "تسعير تعاقدي", platformComparison: { eyebrow: "مقارنة المنصات", title: "قارن من منظور العميل والتسليم.", description: "تربط قنترة سجل العميل والفرصة والمشروع والمستندات والمهام خلف كل عملية تسليم.", button: "قارن المنصات", labels: ["القدرة", "قنترة", "ClickUp", "Asana", "Notion"], sections: comparisonRows.ar, note: "هذه الأوصاف ملخصات مختصرة. راجع وثائق كل مزود الحالية قبل الشراء." }, faq: { heading: ["الأسئلة ", "الشائعة"], subtitleBefore: "اعثر على الإجابات هنا، أو ", contactLabel: "تواصل معنا", subtitleAfter: " إذا احتجت مساعدة في اختيار الخطة.", loadMoreLabel: "عرض المزيد", items: faqItems.ar } },
  fr: { eyebrow: "TARIFS", headline: ["Un espace pour ", "le travail client", "et une livraison ", "connectée."], subtitle: "Choisissez le forfait adapté, puis gardez clients, projets, documents et livraison reliés dans un même espace.", guarantee: "Paiement vérifié · annulation en fin de période", monthlyLabel: "Mensuel", yearlyLabel: "Annuel", plansAriaLabel: "Forfaits tarifaires", compareNote: "Comparez tous les droits et niveaux de support ci-dessous.", monthlyUnitLabel: "Par siège supplémentaire / mois", yearlyUnitLabel: "Par siège supplémentaire / an, facturé annuellement", customPriceLabel: "Tarification contractuelle", platformComparison: { eyebrow: "COMPARAISON DES PLATEFORMES", title: "Comparez sous l’angle client et livraison.", description: "Qentrah relie fiche client, opportunité, projet, documents et tâches derrière chaque livraison.", button: "Comparer les plateformes", labels: ["Capacité", "Qentrah", "ClickUp", "Asana", "Notion"], sections: comparisonRows.fr, note: "Ces descriptions sont résumées. Consultez la documentation actuelle de chaque fournisseur avant achat." }, faq: { heading: ["Questions ", "fréquentes"], subtitleBefore: "Trouvez vos réponses ici ou ", contactLabel: "contactez-nous", subtitleAfter: " pour choisir votre forfait.", loadMoreLabel: "Afficher plus", items: faqItems.fr } },
};

export function getRepositoryPricingPageContent(locale: Locale): PricingPageContent {
  return {
    ...pageCopy[locale],
    plans: planCopy[locale],
    featureComparison: {
      heading: locale === "ar" ? "مقارنة كل المزايا" : locale === "fr" ? "Comparer toutes les fonctionnalités" : "Compare all features",
      ariaLabel: locale === "ar" ? "جدول مقارنة الخطط" : locale === "fr" ? "Tableau comparatif des forfaits" : "Plan comparison table",
      sections: featureSections(locale),
    },
  };
}

export function pricingPlanFacts(planId: SubscriptionPlanId) {
  return {
    entitlements: getGlobalPlan(planId).entitlements,
    monthly: getMarketPricing({ planId, cycle: "monthly" }),
    yearly: getMarketPricing({ planId, cycle: "yearly" }),
  };
}

export function pricingPlanFeatureItems(locale: Locale, planId: SubscriptionPlanId): string[] {
  const { entitlements } = pricingPlanFacts(planId);
  const number = (value: number) => value.toLocaleString(locale === "ar" ? "ar-EG" : locale === "fr" ? "fr-FR" : "en-US");
  const unlimited = locale === "ar" ? "غير محدود" : locale === "fr" ? "Illimité" : "Unlimited";
  const custom = locale === "ar" ? "مخصص بالعقد" : locale === "fr" ? "Défini par contrat" : "Contract-defined";
  const member = planId === "free"
    ? locale === "ar" ? "حتى 3 أعضاء" : locale === "fr" ? "Jusqu’à 3 membres" : "Up to 3 members"
    : planId === "custom" ? custom : locale === "ar" ? "يشمل 3 أعضاء" : locale === "fr" ? "3 membres inclus" : "Includes 3 members";
  const project = entitlements.projectLimit === null ? unlimited : `${number(entitlements.projectLimit)} ${locale === "ar" ? "مشاريع" : locale === "fr" ? "projets" : "projects"}`;
  const ai = entitlements.aiAccess
    ? `${number(entitlements.includedCredits)} ${locale === "ar" ? "رصيد ذكاء شهرياً" : locale === "fr" ? "crédits IA / mois" : "AI credits / month"}`
    : locale === "ar" ? "بدون وصول إلى الذكاء" : locale === "fr" ? "Sans accès IA" : "No AI access";
  const automation = entitlements.automationRunLimit > 0
    ? `${number(entitlements.automationRunLimit)} ${locale === "ar" ? "عملية أتمتة شهرياً" : locale === "fr" ? "automatisations / mois" : "automations / month"}`
    : locale === "ar" ? "بدون أتمتة" : locale === "fr" ? "Sans automatisation" : "No automations";
  const support = locale === "ar" ? `دعم ${entitlements.supportLevel === "community" ? "مجتمعي" : entitlements.supportLevel === "standard" ? "قياسي" : entitlements.supportLevel === "priority" ? "ذو أولوية" : "مكرس"}` : locale === "fr" ? `Support ${entitlements.supportLevel === "community" ? "communautaire" : entitlements.supportLevel === "standard" ? "standard" : entitlements.supportLevel === "priority" ? "prioritaire" : "dédié"}` : `${entitlements.supportLevel[0].toUpperCase()}${entitlements.supportLevel.slice(1)} support`;
  return [member, project, ai, automation, support];
}

export function pricingFeatureValue(
  locale: Locale,
  key: PricingFeatureKey,
  planId: SubscriptionPlanId,
): string | boolean {
  const { entitlements } = pricingPlanFacts(planId);
  const number = (value: number) => value.toLocaleString(locale === "ar" ? "ar-EG" : locale === "fr" ? "fr-FR" : "en-US");
  const unlimited = locale === "ar" ? "غير محدود" : locale === "fr" ? "Illimité" : "Unlimited";
  const custom = locale === "ar" ? "حسب العقد" : locale === "fr" ? "Selon contrat" : "Contract-defined";
  const days = (value: number) => `${number(value)} ${locale === "ar" ? "يوم" : locale === "fr" ? "jours" : value === 1 ? "day" : "days"}`;
  const quota = (value: number | null) => value === null ? unlimited : value === 0 ? false : number(value);

  if (planId === "custom" && ["members", "projects", "storage", "aiCredits"].includes(key)) return custom;

  switch (key) {
    case "members": return entitlements.memberLimit === null ? (planId === "custom" ? custom : locale === "ar" ? "3 مشمولون + مقاعد مدفوعة" : locale === "fr" ? "3 inclus + sièges payants" : "3 included + paid seats") : number(entitlements.memberLimit);
    case "projects": return quota(entitlements.projectLimit);
    case "storage": return entitlements.storageBytesLimit === null ? unlimited : `${number(Math.round(entitlements.storageBytesLimit / 1024 / 1024))} MB`;
    case "aiCredits": return entitlements.aiAccess ? number(entitlements.includedCredits) : false;
    case "guests": return quota(entitlements.guestLimit);
    case "webhooks": return quota(entitlements.webhookLimit);
    case "automations": return entitlements.automationRunLimit === 0 ? false : number(entitlements.automationRunLimit);
    case "apiCalls": return entitlements.apiKeyQuota === 0 ? false : planId === "custom" ? custom : number(entitlements.apiKeyQuota);
    case "agentLinks": return entitlements.agentLinkQuota === 0 ? false : planId === "custom" ? custom : number(entitlements.agentLinkQuota);
    case "customRoles": return entitlements.customRoles;
    case "sso": return entitlements.sso === "none" ? false : entitlements.sso === "google" ? "Google SSO" : "SAML / SCIM";
    case "auditLogs": return entitlements.auditLogDays === null || entitlements.auditLogDays === 0 ? false : days(entitlements.auditLogDays);
    case "support": return locale === "ar" ? ({ community: "مجتمعي", standard: "قياسي", priority: "أولوية", dedicated: "مخصص" } as const)[entitlements.supportLevel] : locale === "fr" ? ({ community: "Communautaire", standard: "Standard", priority: "Prioritaire", dedicated: "Dédié" } as const)[entitlements.supportLevel] : `${entitlements.supportLevel[0].toUpperCase()}${entitlements.supportLevel.slice(1)}`;
  }
}

export const pricingPlanOrder = planIds;
