type ContentfulRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ContentfulRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fieldsOf(value: unknown): ContentfulRecord | null {
  return isRecord(value) && isRecord(value.fields) ? value.fields : null;
}

function linkId(value: unknown): string | null {
  if (!isRecord(value) || !isRecord(value.sys)) return null;
  return typeof value.sys.id === "string" ? value.sys.id : null;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function textList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
  return items.length > 0 ? items : undefined;
}

function textListSized(value: unknown, min: number, max = min): string[] | undefined {
  const items = textList(value);
  return items && items.length >= min && items.length <= max ? items : undefined;
}

function indexById(value: unknown): Map<string, ContentfulRecord> {
  if (!Array.isArray(value)) return new Map();
  return new Map(
    value.flatMap((item) => {
      const id = linkId(item);
      return id && isRecord(item) ? [[id, item] as const] : [];
    }),
  );
}

function resolveEntry(
  value: unknown,
  entries: Map<string, ContentfulRecord>,
): ContentfulRecord | null {
  const inlineFields = fieldsOf(value);
  if (inlineFields) return inlineFields;
  const id = linkId(value);
  return id ? fieldsOf(entries.get(id)) : null;
}

function textCards(
  value: unknown,
  entries: Map<string, ContentfulRecord>,
): Array<[string, string]> | undefined {
  if (!Array.isArray(value)) return undefined;
  const cards = value.flatMap((link) => {
    const fields = resolveEntry(link, entries);
    const title = text(fields?.title);
    const body = text(fields?.body);
    return title && body ? [[title, body] as [string, string]] : [];
  });
  return cards.length > 0 ? cards : undefined;
}

function pageItem(collection: ContentfulRecord): ContentfulRecord | null {
  if (!Array.isArray(collection.items)) return null;
  return fieldsOf(collection.items[0]);
}

/**
 * Converts Contentful's linked landing-page entries into the narrow payload
 * accepted by the repository-owned Marketing presentation overlay.
 */
export function extractContentfulLandingPagePayload(
  value: unknown,
): ContentfulRecord | null {
  if (!isRecord(value)) return null;
  const page = pageItem(value);
  if (!page) return null;

  const includes = isRecord(value.includes) ? value.includes : {};
  const entries = indexById(includes.Entry);
  const hero = resolveEntry(page.hero, entries);
  const platform = resolveEntry(page.platformStory, entries);
  const ai = resolveEntry(page.aiOutcomes, entries);
  const trust = resolveEntry(page.trust, entries);
  const cta = resolveEntry(page.cta, entries);

  if (!hero && !platform && !ai && !trust && !cta) return null;

  const agentCapabilities = textCards(platform?.agentCapabilities, entries);
  const trustItems = textCards(trust?.items, entries);

  return {
    hero: {
      eyebrow: text(hero?.eyebrow),
      title: text(hero?.title),
      cta: text(hero?.primaryActionLabel),
      benefits: textCards(hero?.benefits, entries),
      note: text(hero?.note),
      modulesLabel: text(hero?.modulesLabel),
      modules: textList(hero?.modules),
    },
    landingPage: {
      platformStory: {
        contextTitle: text(platform?.contextTitle),
        contextBody: text(platform?.contextBody),
        platformTitle: text(platform?.platformTitle),
        platformBody: text(platform?.platformBody),
        agentTitle: text(platform?.agentTitle),
        agentBody: text(platform?.agentBody),
        buildAgent: text(platform?.primaryActionLabel),
        learn: text(platform?.secondaryActionLabel),
        agentCapabilities: agentCapabilities && agentCapabilities.length >= 5 && agentCapabilities.length <= 6
          ? agentCapabilities
          : undefined,
      },
      aiOutcomes: {
        solutionsTitle: text(ai?.solutionsTitle),
        solutionsBody: text(ai?.solutionsBody),
        solution: {
          kicker: text(ai?.solutionKicker),
          bullets: textList(ai?.solutionBullets),
        },
        explore: text(ai?.exploreLabel),
      },
      trust: {
        kicker: text(trust?.kicker),
        title: text(trust?.title),
        body: text(trust?.body),
        items: trustItems?.length === 3 ? trustItems : undefined,
        assurance: text(trust?.assurance),
        marks: textListSized(trust?.marks, 2),
      },
      cta: {
        kicker: text(cta?.kicker),
        title: text(cta?.title),
        body: text(cta?.body),
        primary: text(cta?.primaryActionLabel),
        sales: text(cta?.salesActionLabel),
        note: text(cta?.note),
        points: textList(cta?.points),
        visualLabel: text(cta?.visualLabel),
        visualTitle: text(cta?.visualTitle),
      },
    },
  };
}
