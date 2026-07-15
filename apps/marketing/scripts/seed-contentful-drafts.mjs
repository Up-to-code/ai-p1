import { readFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const cmsLocale = "en-US";
const localize = (fields) => Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, { [cmsLocale]: value }]));
const link = (id) => ({ sys: { type: "Link", linkType: "Entry", id } });
const assetLink = (id) => ({ sys: { type: "Link", linkType: "Asset", id } });

const homePageIds = {
  en: "2ADzleizFvszIWsJ6AHhdh",
  ar: "2pUFIngcue5NAAAVDeEJoA",
  fr: "3qgqRD2lFi9ro8Zuf9vsrv",
};

const homeHeroIds = {
  en: "3zfe6huKlLAeiOAggoFjmw",
  ar: "3Kt20xOniF3YJRv9NHHFwd",
  fr: "3G61SoVPqLbnyCC8T7lrpg",
};

const platformStoryIds = {
  en: "5YUEH3L0rIiUwPqPSqSor3",
  ar: "3Jwoz3FxOztNSidtiH5RQL",
  fr: "1JaXwHYrNRjFJfQ9OFZPDN",
};

const content = {
  en: {
    brand: ["Qentrah", "Qentrah home"],
    nav: ["A workspace designed around client delivery", "Platform", "AI", "Solutions", "Resources", "Pricing", "Enterprise", "Explore", "Structure", "Coordinate", "Intelligence", "Sign up", "Contact sales", "Sign in", "Open menu", "Close menu"],
    root: ["Qentrah connects clients, projects, documents, and delivery in one workspace.", "Product", "Company", "Resources", "Legal", "Contact", "hello@qentrah.com", "© Qentrah", "Home", "Pricing", "Documentation"],
    home: ["Deliver client work with every detail connected", "Start with the client, then keep every delivery connected.", "Workspace modules", "Client context", "Project delivery", "Document workspace", "AI assistance"],
    benefits: ["Keep requests, decisions, and relationships attached to the client.", "Move plans, owners, risks, and handoffs through one delivery flow.", "Write briefs and decisions beside the work they explain."],
    workspaceCells: ["Connected search", "Tasks", "Spaces", "Calendar", "Approvals", "Inbox", "Forms", "Dashboards", "Workflows", "Team spaces", "Reminders", "Project planning", "Team members", "Docs", "Projects", "Goals", "Project status", "Knowledge", "AI agents", "Communication", "Deep search", "Dependencies", "Milestones", "Activity history", "Automations", "Permissions", "Linked work", "Insights", "Templates", "Handoffs", "Scoped access", "MCP tools"],
    pricing: ["PRICING", "One workspace for ", "client work", "and connected ", "delivery.", "Choose a plan for your team and keep delivery connected.", "Verified checkout · cancel at period end", "Monthly", "Yearly", "Pricing plans", "Compare every entitlement below.", "Per additional seat / month", "Per additional seat / year", "Contract pricing"],
    faq: [["Can I change plans later?", "Yes. Upgrades activate after verified payment, while downgrades apply at period end."], ["What is included with each plan?", "Each plan combines workspace access, usage limits, and a monthly AI allowance."], ["Do purchased AI credits expire?", "Purchased credits do not expire and are consumed after included monthly credits."], ["How are additional seats billed?", "Unlimited and Business include three members; additional seats use the selected billing cycle."], ["Can I cancel?", "Yes. Cancellation takes effect at the end of the current paid period."]],
    featureLabels: ["Team members", "Projects", "Storage", "AI credits", "Guests", "Webhooks", "Automations", "API calls", "Agent links", "Custom roles", "Single sign-on", "Audit history", "Support"],
    legalTitles: { privacy: "Privacy Policy", terms: "Terms of Service", legal: "Legal Notice", updated: "Last updated: July 14, 2026" },
  },
  ar: {
    brand: ["قنترة", "الصفحة الرئيسية لقنترة"],
    nav: ["مساحة عمل مصممة حول تسليم أعمال العملاء", "المنصة", "الذكاء", "الحلول", "الموارد", "التسعير", "المؤسسات", "استكشف", "نظّم", "نسّق", "الذكاء", "إنشاء حساب", "تواصل مع المبيعات", "تسجيل الدخول", "فتح القائمة", "إغلاق القائمة"],
    root: ["تربط قنترة العملاء والمشاريع والمستندات والتسليم في مساحة واحدة.", "المنتج", "الشركة", "الموارد", "قانوني", "تواصل", "hello@qentrah.com", "© قنترة", "الرئيسية", "التسعير", "التوثيق"],
    home: ["أنجز عمل العملاء وكل التفاصيل مترابطة", "ابدأ بالعميل وحافظ على كل عملية تسليم مترابطة.", "وحدات مساحة العمل", "سياق العميل", "تسليم المشروع", "مساحة المستندات", "مساعدة الذكاء"],
    benefits: ["أبقِ الطلبات والقرارات والعلاقات مرتبطة بسجل العميل.", "حرّك الخطط والمسؤوليات والمخاطر والتسليمات في مسار واحد.", "اكتب الملخصات والقرارات بجوار العمل الذي تشرحه."],
    workspaceCells: ["بحث مترابط", "المهام", "المساحات", "التقويم", "الموافقات", "البريد الوارد", "النماذج", "لوحات المعلومات", "مسارات العمل", "مساحات الفريق", "التذكيرات", "تخطيط المشاريع", "أعضاء الفريق", "المستندات", "المشاريع", "الأهداف", "حالة المشروع", "المعرفة", "وكلاء الذكاء", "التواصل", "البحث العميق", "الاعتماديات", "المراحل الرئيسية", "سجل النشاط", "الأتمتة", "الصلاحيات", "العمل المترابط", "الرؤى", "القوالب", "عمليات التسليم", "وصول محدد النطاق", "أدوات MCP"],
    pricing: ["التسعير", "مساحة واحدة ", "لعمل العميل", "وتسليم ", "مترابط.", "اختر خطة فريقك وحافظ على التنفيذ مترابطاً.", "دفع موثّق · الإلغاء في نهاية الفترة", "شهري", "سنوي", "خطط التسعير", "قارن كل الصلاحيات أدناه.", "لكل مقعد إضافي / شهر", "لكل مقعد إضافي / سنة", "تسعير تعاقدي"],
    faq: [["هل يمكن تغيير الخطة لاحقاً؟", "نعم. تُفعّل الترقية بعد الدفع الموثّق، بينما يسري التخفيض في نهاية الفترة."], ["ما الذي تتضمنه كل خطة؟", "تجمع كل خطة وصول مساحة العمل وحدود الاستخدام ورصيد ذكاء شهري."], ["هل تنتهي أرصدة الذكاء المشتراة؟", "لا تنتهي الأرصدة المشتراة وتُستهلك بعد الرصيد الشهري المشمول."], ["كيف تُفوتر المقاعد الإضافية؟", "تشمل خطتا غير محدود والأعمال ثلاثة أعضاء، وتستخدم المقاعد الإضافية دورة الفوترة المختارة."], ["هل يمكن الإلغاء؟", "نعم، يسري الإلغاء في نهاية الفترة المدفوعة الحالية."]],
    featureLabels: ["أعضاء الفريق", "المشاريع", "التخزين", "أرصدة الذكاء", "الضيوف", "خطافات الويب", "الأتمتة", "استدعاءات API", "روابط الوكلاء", "الأدوار المخصصة", "الدخول الموحد", "سجل التدقيق", "الدعم"],
    legalTitles: { privacy: "سياسة الخصوصية", terms: "شروط الخدمة", legal: "إشعار قانوني", updated: "آخر تحديث: 14 يوليو 2026" },
  },
  fr: {
    brand: ["Qentrah", "Accueil Qentrah"],
    nav: ["Un espace conçu autour de la livraison client", "Plateforme", "IA", "Solutions", "Ressources", "Tarifs", "Entreprise", "Explorer", "Structurer", "Coordonner", "Intelligence", "S’inscrire", "Contacter l’équipe", "Se connecter", "Ouvrir le menu", "Fermer le menu"],
    root: ["Qentrah relie clients, projets, documents et livraison dans un même espace.", "Produit", "Entreprise", "Ressources", "Juridique", "Contact", "hello@qentrah.com", "© Qentrah", "Accueil", "Tarifs", "Documentation"],
    home: ["Livrez le travail client sans perdre le moindre contexte", "Commencez par le client et gardez chaque livraison connectée.", "Modules de l’espace", "Contexte client", "Livraison projet", "Espace documentaire", "Assistance IA"],
    benefits: ["Gardez demandes, décisions et relations attachées à chaque client.", "Faites avancer plans, responsables, risques et relais dans un même flux.", "Rédigez briefs et décisions à côté du travail qu’ils expliquent."],
    workspaceCells: ["Recherche connectée", "Tâches", "Espaces", "Calendrier", "Validations", "Boîte de réception", "Formulaires", "Tableaux de bord", "Flux de travail", "Espaces d’équipe", "Rappels", "Planification", "Membres", "Documents", "Projets", "Objectifs", "Statut projet", "Connaissance", "Agents IA", "Communication", "Recherche avancée", "Dépendances", "Jalons", "Historique", "Automatisations", "Autorisations", "Travail relié", "Analyses", "Modèles", "Relais", "Accès cadré", "Outils MCP"],
    pricing: ["TARIFS", "Un espace pour ", "le travail client", "et une livraison ", "connectée.", "Choisissez le forfait de votre équipe et gardez la livraison connectée.", "Paiement vérifié · annulation en fin de période", "Mensuel", "Annuel", "Forfaits tarifaires", "Comparez tous les droits ci-dessous.", "Par siège supplémentaire / mois", "Par siège supplémentaire / an", "Tarification contractuelle"],
    faq: [["Puis-je changer de forfait plus tard ?", "Oui. Les mises à niveau suivent un paiement vérifié et les réductions prennent effet en fin de période."], ["Que comprend chaque forfait ?", "Chaque forfait réunit accès à l’espace, limites d’usage et allocation IA mensuelle."], ["Les crédits IA achetés expirent-ils ?", "Non. Ils sont consommés après les crédits mensuels inclus."], ["Comment les sièges supplémentaires sont-ils facturés ?", "Illimité et Business incluent trois membres, puis les sièges suivent le cycle choisi."], ["Puis-je annuler ?", "Oui. L’annulation prend effet à la fin de la période payée."]],
    featureLabels: ["Membres de l’équipe", "Projets", "Stockage", "Crédits IA", "Invités", "Webhooks", "Automatisations", "Appels API", "Liens d’agents", "Rôles personnalisés", "Authentification unique", "Historique d’audit", "Support"],
    legalTitles: { privacy: "Politique de confidentialité", terms: "Conditions d’utilisation", legal: "Mentions légales", updated: "Dernière mise à jour : 14 juillet 2026" },
  },
};

async function environment() {
  const env = { ...process.env };
  const source = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator > 0) env[line.slice(0, separator)] = line.slice(separator + 1).replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function output(result) {
  return result.content?.map((item) => item.type === "text" ? item.text : "").join("\n") ?? "";
}

async function call(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) throw new Error(`${name} failed: ${output(result)}`);
  return result;
}

function entryId(result) {
  const text = output(result);
  return text.match(/<entry>[\s\S]*?<id>([^<]+)<\/id>/)?.[1] ?? [...text.matchAll(/<id>([^<]+)<\/id>/g)].at(1)?.[1] ?? null;
}

async function ensureDraft(client, scope, contentTypeId, internalName, fields) {
  const found = await call(client, "search_entries", { ...scope, query: { content_type: contentTypeId, "fields.internalName": internalName, limit: 1 } });
  const existingId = entryId(found);
  if (existingId) {
    await updateDraft(client, scope, existingId, fields);
    return existingId;
  }
  const created = await call(client, "create_entry", { ...scope, contentTypeId, fields: localize({ internalName, ...fields }) });
  const createdId = entryId(created);
  if (!createdId) throw new Error(`Could not read created entry ID for ${internalName}`);
  console.log(`draft ${internalName}`);
  return createdId;
}

async function ensureAsset(client, scope, title, fileName) {
  for (let skip = 0; ; skip += 3) {
    const result = await call(client, "list_assets", { ...scope, limit: 3, skip });
    const body = output(result);
    for (const item of body.matchAll(/<items>([\s\S]*?)<\/items>/g)) {
      if (item[1].match(/<title>([^<]+)<\/title>/)?.[1] === title) {
        const id = item[1].match(/<id>([^<]+)<\/id>/)?.[1];
        if (id) return id;
      }
    }
    const total = Number(body.match(/<total>(\d+)<\/total>/)?.[1] ?? 0);
    if (skip + 3 >= total) break;
  }
  const bytes = await readFile(new URL(`../public/${fileName}`, import.meta.url));
  const contentType = fileName.endsWith(".png") ? "image/png" : "image/svg+xml";
  const created = await call(client, "upload_asset", {
    ...scope,
    title,
    description: `${title} for editable Qentrah Marketing artwork`,
    file: { fileName, contentType, upload: `data:${contentType};base64,${bytes.toString("base64")}` },
  });
  const id = [...output(created).matchAll(/<id>([^<]+)<\/id>/g)].at(1)?.[1] ?? output(created).match(/<id>([^<]+)<\/id>/)?.[1];
  if (!id) throw new Error(`Could not read asset ID for ${title}`);
  console.log(`draft asset ${title}`);
  return id;
}

async function updateDraft(client, scope, entryId, fields) {
  const current = await call(client, "get_entry", { ...scope, entryId });
  const version = Number(output(current).match(/<version>(\d+)<\/version>/)?.[1]);
  if (!Number.isInteger(version)) throw new Error(`Could not read version for ${entryId}`);
  await call(client, "update_entry", { ...scope, entryId, version, fields: localize(fields) });
}

const env = await environment();
const scope = { spaceId: env.CONTENTFUL_SPACE_ID, environmentId: env.CONTENTFUL_ENVIRONMENT || "master" };
if (!scope.spaceId || !env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) throw new Error("Missing Contentful management configuration");
const client = new Client({ name: "qentrah-marketing-draft-seed", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "npx", args: ["-y", "@contentful/mcp-server"], env }));
try {
  const brandLightAssetId = await ensureAsset(client, scope, "Qentrah brand mark · light surface", "logo-derk-color.svg");
  const brandDarkAssetId = await ensureAsset(client, scope, "Qentrah brand mark · dark surface", "logo-dark-mood.svg");
  const agentImageAssetIds = await Promise.all([
    ensureAsset(client, scope, "Qentrah agent capability · workspace memory", "landing-images/agent-capability-1.png"),
    ensureAsset(client, scope, "Qentrah agent capability · context intelligence", "landing-images/agent-capability-2.png"),
    ensureAsset(client, scope, "Qentrah agent capability · scoped execution", "landing-images/agent-capability-3.png"),
  ]);
  for (const platformStoryId of Object.values(platformStoryIds)) {
    await updateDraft(client, scope, platformStoryId, {
      agentImages: agentImageAssetIds.map(assetLink),
    });
  }
  for (const [siteLocale, copy] of Object.entries(content)) {
    const accentColor = siteLocale === "ar" ? "#6B5CF6" : siteLocale === "fr" ? "#3366CC" : "#555555";
    const nav = copy.nav;
    const price = copy.pricing;
    const footer = copy.root;
    const home = copy.home;
    const brandId = await ensureDraft(client, scope, "qentrahBrandBlock", `Marketing brand · ${siteLocale}`, {
      displayName: copy.brand[0], accessibleName: copy.brand[1], accentColor, markLight: assetLink(brandLightAssetId), markDark: assetLink(brandDarkAssetId),
    });
    const navigationLabels = [home[3], home[4], home[5], home[6], nav[3], nav[4], nav[2], nav[8], nav[9]];
    const navigationItemIds = [];
    for (let index = 0; index < navigationLabels.length; index += 1) {
      navigationItemIds.push(await ensureDraft(client, scope, "qentrahNavigationItem", `Navigation feature ${index + 1} · ${siteLocale}`, {
        label: navigationLabels[index], description: `${home[1]} ${navigationLabels[index]}`,
      }));
    }
    const navigationId = await ensureDraft(client, scope, "qentrahNavigationBlock", `Marketing navigation · ${siteLocale}`, {
      announcement: nav[0], platform: nav[1], ai: nav[2], solutions: nav[3], resources: nav[4], pricing: nav[5], enterprise: nav[6], explore: nav[7], structure: nav[8], coordinate: nav[9], intelligence: nav[10], signUp: nav[11], sales: nav[12], signIn: nav[13], openMenu: nav[14], closeMenu: nav[15], mainNavigationAriaLabel: nav[0],
    });
    await updateDraft(client, scope, navigationId, { platformItems: navigationItemIds.map(link) });
    const faqQuestions = copy.faq.map(([question]) => question);
    const faqItemIds = [];
    for (let index = 0; index < faqQuestions.length; index += 1) {
      faqItemIds.push(await ensureDraft(client, scope, "qentrahFaqItem", `FAQ item ${index + 1} · ${siteLocale}`, {
        question: faqQuestions[index], answer: copy.faq[index][1],
      }));
    }
    const faqId = await ensureDraft(client, scope, "qentrahFaqBlock", `Pricing FAQ · ${siteLocale}`, {
      eyebrow: nav[4], title: price[10], heading: [price[0], nav[4]], description: price[5], subtitleBefore: price[5], contactLabel: nav[12], subtitleAfter: price[10], loadMoreLabel: nav[7], items: faqItemIds.map(link),
    });
    const logoNames = [copy.brand[0], ...home.slice(3), nav[2]];
    const logoItemIds = [];
    for (let index = 0; index < logoNames.length; index += 1) {
      logoItemIds.push(await ensureDraft(client, scope, "qentrahLogoCloudItem", `Logo cloud item ${index + 1} · ${siteLocale}`, {
        name: logoNames[index], icon: assetLink(brandLightAssetId),
      }));
    }
    const logoCloudId = await ensureDraft(client, scope, "qentrahLogoCloudBlock", `Home logo cloud · ${siteLocale}`, {
      label: nav[0], items: logoItemIds.map(link),
    });
    const homeSupportId = await ensureDraft(client, scope, "qentrahHomeSupportBlock", `Home support · ${siteLocale}`, {
      workspaceCells: copy.workspaceCells, solutionTabs: navigationLabels.slice(0, 5), showcaseImageAlt: home[1], logoCloud: link(logoCloudId), faq: link(faqId),
    });
    const planIds = ["free", "good", "better", "custom"];
    const planNames = siteLocale === "ar" ? ["مجاني", "غير محدود", "الأعمال", "المؤسسات"] : siteLocale === "fr" ? ["Gratuit", "Illimité", "Business", "Entreprise"] : ["Free", "Unlimited", "Business", "Enterprise"];
    const planEntryIds = [];
    for (let index = 0; index < planIds.length; index += 1) {
      planEntryIds.push(await ensureDraft(client, scope, "qentrahPricingPlanCopy", `Pricing ${planIds[index]} · ${siteLocale}`, {
        planId: planIds[index], name: planNames[index], description: price[5], cta: index === 3 ? nav[12] : nav[11], sectionHeader: price[10], moreLabel: nav[7],
      }));
    }
    const featureKeys = ["members", "projects", "storage", "aiCredits", "guests", "webhooks", "automations", "apiCalls", "agentLinks", "customRoles", "sso", "auditLogs", "support"];
    const featureRowIds = [];
    for (const featureKey of featureKeys) {
      featureRowIds.push(await ensureDraft(client, scope, "qentrahPricingFeatureRow", `Pricing ${featureKey} row · ${siteLocale}`, {
        featureKey, label: copy.featureLabels[featureRowIds.length],
      }));
    }
    const featureSectionIds = [];
    for (const [index, rowIds] of [featureRowIds.slice(0, 4), featureRowIds.slice(4, 9), featureRowIds.slice(9)].entries()) {
      featureSectionIds.push(await ensureDraft(client, scope, "qentrahPricingFeatureSection", `Pricing feature section ${index + 1} · ${siteLocale}`, {
        category: `${home[2]} ${index + 1}`, rows: rowIds.map(link),
      }));
    }
    const comparisonRowIds = [];
    for (let index = 0; index < 3; index += 1) {
      comparisonRowIds.push(await ensureDraft(client, scope, "qentrahComparisonRow", `Platform comparison row ${index + 1} · ${siteLocale}`, {
        capability: navigationLabels[index], qentrah: home[1], clickup: nav[1], asana: nav[1], notion: nav[1],
      }));
    }
    const comparisonSectionId = await ensureDraft(client, scope, "qentrahComparisonSection", `Platform comparison section · ${siteLocale}`, {
      label: nav[1], rows: comparisonRowIds.map(link),
    });
    const pricingId = await ensureDraft(client, scope, "qentrahPricingPage", `Pricing page · ${siteLocale}`, {
      eyebrow: price[0], headline: price.slice(1, 5), subtitle: price[5], guarantee: price[6], monthlyLabel: price[7], yearlyLabel: price[8], plansAriaLabel: price[9], compareNote: price[10], monthlyUnitLabel: price[11], yearlyUnitLabel: price[12], customPriceLabel: price[13], featureHeading: price[10], featureAriaLabel: price[9], platformEyebrow: nav[1], platformTitle: price[10], platformDescription: price[5], platformButton: nav[1], platformLabels: [nav[1], "Qentrah", "ClickUp", "Asana", "Notion"], platformNote: price[10],
    });
    await updateDraft(client, scope, pricingId, {
      plans: planEntryIds.map(link), featureSections: featureSectionIds.map(link), platformSections: [link(comparisonSectionId)], faq: link(faqId),
    });
    const legalPageIds = [];
    for (const pageKey of ["privacy", "terms", "legal"]) {
      const sectionIds = [];
      for (let index = 0; index < 3; index += 1) {
        sectionIds.push(await ensureDraft(client, scope, "qentrahLegalSection", `${pageKey} section ${index + 1} · ${siteLocale}`, {
          title: `${copy.legalTitles[pageKey]} · ${index + 1}`, body: `${footer[0]}\n\n${home[1]}`, bulletItems: [footer[4], footer[5]],
        }));
      }
      legalPageIds.push(await ensureDraft(client, scope, "qentrahLegalPage", `${pageKey} page · ${siteLocale}`, {
        pageKey, eyebrow: footer[4], title: copy.legalTitles[pageKey], updated: copy.legalTitles.updated, sections: sectionIds.map(link),
      }));
    }
    const seoEntryIds = [];
    for (const pageKey of ["home", "pricing", "privacy", "terms", "legal"]) {
      seoEntryIds.push(await ensureDraft(client, scope, "qentrahSeoEntry", `${pageKey} SEO · ${siteLocale}`, {
        pageKey, title: `${copy.brand[0]} · ${pageKey}`, description: footer[0], keywords: [copy.brand[0], home[4]], socialImage: assetLink(brandLightAssetId), socialImageAlt: `${copy.brand[0]} · ${pageKey}`,
      }));
    }
    const benefitEntryIds = [];
    for (let index = 0; index < 3; index += 1) {
      benefitEntryIds.push(await ensureDraft(client, scope, "qentrahLandingTextCard", `Home benefit ${index + 1} · ${siteLocale}`, {
        title: navigationLabels[index], body: copy.benefits[index],
      }));
    }
    await updateDraft(client, scope, homeHeroIds[siteLocale], {
      title: home[0], benefits: benefitEntryIds.map(link), note: home[1], modulesLabel: home[2], modules: navigationLabels.slice(0, 8), imageAlt: home[1],
    });
    const rootId = await ensureDraft(client, scope, "qentrahFooterBlock", `Marketing site · ${siteLocale}`, {
      locale: siteLocale, brand: link(brandId), navigation: link(navigationId), homePage: link(homePageIds[siteLocale]), homeSupport: link(homeSupportId), pricingPage: link(pricingId), footerTagline: nav[0], description: footer[0], product: footer[1], company: footer[2], legal: footer[4], contact: footer[5], copyright: footer[7], companyLinks: [footer[8]], legalLinks: [copy.legalTitles.privacy, copy.legalTitles.terms, copy.legalTitles.legal], resourceLinks: [footer[8], footer[9], footer[10]],
    });
    await updateDraft(client, scope, rootId, {
      legalPages: legalPageIds.map(link), seoEntries: seoEntryIds.map(link),
    });
  }
} finally {
  await client.close();
}
