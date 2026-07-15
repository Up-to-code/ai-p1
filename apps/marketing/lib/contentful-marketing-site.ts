import { extractContentfulLandingPagePayload } from "./contentful-landing-page";

type ContentfulRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ContentfulRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fieldsOf(value: unknown): ContentfulRecord | null {
  return isRecord(value) && isRecord(value.fields) ? value.fields : null;
}

function linkId(value: unknown): string | null {
  return isRecord(value) && isRecord(value.sys) && typeof value.sys.id === "string"
    ? value.sys.id
    : null;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function textList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  return result.length ? result : undefined;
}

function textListSized(value: unknown, min: number, max = min): string[] | undefined {
  const items = textList(value);
  return items && items.length >= min && items.length <= max ? items : undefined;
}

function color(value: unknown): string | undefined {
  const candidate = text(value);
  return candidate && /^#[0-9a-f]{6}$/iu.test(candidate) ? candidate : undefined;
}

function indexById(value: unknown) {
  if (!Array.isArray(value)) return new Map<string, ContentfulRecord>();
  return new Map(value.flatMap((item) => {
    const id = linkId(item);
    return id && isRecord(item) ? [[id, item] as const] : [];
  }));
}

function resolve(value: unknown, entries: Map<string, ContentfulRecord>) {
  const inline = fieldsOf(value);
  if (inline) return inline;
  const id = linkId(value);
  return id ? fieldsOf(entries.get(id)) : null;
}

function assetUrl(value: unknown, assets: Map<string, ContentfulRecord>) {
  const id = linkId(value);
  const fields = fieldsOf(id ? assets.get(id) : value);
  if (!fields || !isRecord(fields.file)) return undefined;
  const url = text(fields.file.url);
  return url?.startsWith("//") ? `https:${url}` : url;
}

function entryList(value: unknown, entries: Map<string, ContentfulRecord>) {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const fields = resolve(item, entries);
        return fields ? [fields] : [];
      })
    : [];
}

function tupleEntries(value: unknown, entries: Map<string, ContentfulRecord>, first: string, second: string) {
  const tuples = entryList(value, entries).flatMap((fields) => {
    const left = text(fields[first]);
    const right = text(fields[second]);
    return left && right ? [[left, right] as [string, string]] : [];
  });
  return tuples.length ? tuples : undefined;
}

function faqPayload(value: unknown, entries: Map<string, ContentfulRecord>) {
  const faq = resolve(value, entries);
  return faq ? {
    eyebrow: text(faq.eyebrow),
    title: text(faq.title),
    description: text(faq.description),
    heading: textListSized(faq.heading, 2),
    subtitleBefore: text(faq.subtitleBefore),
    contactLabel: text(faq.contactLabel),
    subtitleAfter: text(faq.subtitleAfter),
    loadMoreLabel: text(faq.loadMoreLabel),
    items: tupleEntries(faq.items, entries, "question", "answer"),
  } : undefined;
}

function logoCloudPayload(value: unknown, entries: Map<string, ContentfulRecord>, assets: Map<string, ContentfulRecord>) {
  const cloud = resolve(value, entries);
  if (!cloud) return undefined;
  const items = entryList(cloud.items, entries).flatMap((item) => {
    const name = text(item.name);
    const image = assetUrl(item.icon, assets);
    return name && image ? [{ name, image }] : [];
  });
  return { label: text(cloud.label), items: items.length ? items : undefined };
}

function pricingPayload(fields: ContentfulRecord | null, entries: Map<string, ContentfulRecord>) {
  if (!fields) return undefined;
  const plans = entryList(fields.plans, entries).flatMap((plan) => {
    const id = text(plan.planId);
    const name = text(plan.name);
    if (!id || !name) return [];
    return [{ id, name, description: text(plan.description), badge: text(plan.badge), cta: text(plan.cta), sectionHeader: text(plan.sectionHeader), moreLabel: text(plan.moreLabel) }];
  });
  const expectedPlanIds = ["free", "good", "better", "custom"];
  const completePlans = plans.length === expectedPlanIds.length
    && expectedPlanIds.every((id) => plans.some((plan) => plan.id === id));
  const featureSections = entryList(fields.featureSections, entries).map((section) => ({
    category: text(section.category),
    rows: entryList(section.rows, entries).map((row) => ({ key: text(row.featureKey), label: text(row.label) })),
  }));
  const platformSections = entryList(fields.platformSections, entries).map((section) => ({
    label: text(section.label),
    rows: entryList(section.rows, entries).map((row) => [text(row.capability), text(row.qentrah), text(row.clickup), text(row.asana), text(row.notion)]),
  }));
  const faq = faqPayload(fields.faq, entries);
  return {
    eyebrow: text(fields.eyebrow),
    headline: textListSized(fields.headline, 4),
    subtitle: text(fields.subtitle),
    guarantee: text(fields.guarantee),
    monthlyLabel: text(fields.monthlyLabel),
    yearlyLabel: text(fields.yearlyLabel),
    plansAriaLabel: text(fields.plansAriaLabel),
    compareNote: text(fields.compareNote),
    monthlyUnitLabel: text(fields.monthlyUnitLabel),
    yearlyUnitLabel: text(fields.yearlyUnitLabel),
    customPriceLabel: text(fields.customPriceLabel),
    plans: completePlans ? plans : undefined,
    featureComparison: {
      heading: text(fields.featureHeading),
      ariaLabel: text(fields.featureAriaLabel),
      sections: featureSections.length ? featureSections : undefined,
    },
    platformComparison: {
      eyebrow: text(fields.platformEyebrow),
      title: text(fields.platformTitle),
      description: text(fields.platformDescription),
      button: text(fields.platformButton),
      labels: textListSized(fields.platformLabels, 5),
      sections: platformSections.length ? platformSections : undefined,
      note: text(fields.platformNote),
    },
    faq,
  };
}

/** Resolves the input/reference-based Marketing site composition returned by Contentful. */
export function extractContentfulMarketingSitePayload(value: unknown): ContentfulRecord | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;
  const rootEntry = value.items[0];
  const root = fieldsOf(rootEntry);
  if (!root) return null;
  const includes = isRecord(value.includes) ? value.includes : {};
  const entries = indexById(includes.Entry);
  const assets = indexById(includes.Asset);
  const brand = resolve(root.brand, entries);
  const navigation = resolve(root.navigation, entries);
  const pricing = resolve(root.pricingPage, entries);
  const homeSupport = resolve(root.homeSupport, entries);
  const homeId = linkId(root.homePage);
  const homeEntry = homeId ? entries.get(homeId) : undefined;
  const landing = homeEntry
    ? extractContentfulLandingPagePayload({ items: [homeEntry], includes })
    : null;
  const landingHero = isRecord(landing?.hero) ? landing.hero : {};

  return {
    ...landing,
    brand: {
      displayName: text(brand?.displayName),
      accessibleName: text(brand?.accessibleName),
      markLight: assetUrl(brand?.markLight, assets),
      markDark: assetUrl(brand?.markDark, assets),
      accentColor: color(brand?.accentColor),
    },
    navigation: navigation ? {
      announcement: text(navigation.announcement),
      platform: text(navigation.platform),
      ai: text(navigation.ai),
      solutions: text(navigation.solutions),
      resources: text(navigation.resources),
      pricing: text(navigation.pricing),
      enterprise: text(navigation.enterprise),
      explore: text(navigation.explore),
      structure: text(navigation.structure),
      coordinate: text(navigation.coordinate),
      intelligence: text(navigation.intelligence),
      signUp: text(navigation.signUp),
      signIn: text(navigation.signIn),
      sales: text(navigation.sales),
      openMenu: text(navigation.openMenu),
      closeMenu: text(navigation.closeMenu),
      platformItems: entryList(navigation.platformItems, entries).map((item) => ({ label: text(item.label), description: text(item.description) })),
      mainNavigation: text(navigation.mainNavigationAriaLabel),
    } : undefined,
    footer: {
      tagline: text(root.footerTagline),
      description: text(root.description),
      platform: text(root.product),
      workspace: text(root.company),
      legal: text(root.legal),
      contact: text(root.contact),
      privacy: textList(root.legalLinks)?.[0],
      terms: textList(root.legalLinks)?.[1],
      copyright: text(root.copyright),
      platformLinkLabels: textList(root.resourceLinks),
      workspaceLinkLabels: textList(root.companyLinks),
      legalLinkLabels: textList(root.legalLinks),
    },
    hero: {
      ...landingHero,
      title: text(landingHero.title),
      benefits: Array.isArray(landingHero.benefits) ? landingHero.benefits : undefined,
      note: text(landingHero.note),
      modulesLabel: text(landingHero.modulesLabel),
      modules: textList(landingHero.modules),
    },
    landingPage: {
      ...(isRecord(landing?.landingPage) ? landing.landingPage : {}),
      support: {
        workspaceCells: textListSized(homeSupport?.workspaceCells, 32),
        solutionTabs: textListSized(homeSupport?.solutionTabs, 5),
        logoCloud: logoCloudPayload(homeSupport?.logoCloud, entries, assets),
        faq: faqPayload(homeSupport?.faq, entries),
      },
    },
    pricingPage: pricingPayload(pricing, entries),
    legalPages: entryList(root.legalPages, entries).flatMap((page) => {
      const pageKey = text(page.pageKey);
      const eyebrow = text(page.eyebrow);
      const title = text(page.title);
      const updated = text(page.updated);
      if (!pageKey || !eyebrow || !title || !updated) return [];
      return [{
        pageKey,
        eyebrow,
        title,
        updated,
        sections: entryList(page.sections, entries).flatMap((section) => {
          const sectionTitle = text(section.title);
          const body = text(section.body);
          return sectionTitle && body ? [{ title: sectionTitle, body, bulletItems: textList(section.bulletItems) ?? [] }] : [];
        }),
      }];
    }),
    seoEntries: entryList(root.seoEntries, entries).flatMap((entry) => {
      const pageKey = text(entry.pageKey);
      const title = text(entry.title);
      const description = text(entry.description);
      if (!pageKey || !title || !description) return [];
      return [{ pageKey, title, description, keywords: textList(entry.keywords) ?? [], socialImage: assetUrl(entry.socialImage, assets) ?? "", socialImageAlt: text(entry.socialImageAlt) ?? title }];
    }),
  };
}
