import {
  getMarketingMessages,
  getRepositoryMarketingPresentation,
  type Locale,
  type MarketingPresentation,
} from "./content";

type MarketingMessages = ReturnType<typeof getMarketingMessages>;

export type MarketingContentSnapshot = {
  messages: MarketingMessages;
  presentation: MarketingPresentation;
  source: "contentful" | "repository";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const fixedArraySizes = new Map<string, { min: number; max: number }>([
  ["navigation.platformItems", { min: 9, max: 9 }],
  ["footer.platformLinkLabels", { min: 3, max: 3 }],
  ["footer.workspaceLinkLabels", { min: 1, max: 1 }],
  ["footer.legalLinkLabels", { min: 3, max: 3 }],
  ["landingPage.platformStory.agentCapabilities", { min: 5, max: 6 }],
  ["landingPage.trust.items", { min: 3, max: 3 }],
  ["landingPage.trust.marks", { min: 2, max: 2 }],
  ["landingPage.support.workspaceCells", { min: 32, max: 32 }],
  ["landingPage.support.solutionTabs", { min: 5, max: 5 }],
  ["pricingPage.headline", { min: 4, max: 4 }],
  ["pricingPage.plans", { min: 4, max: 4 }],
  ["pricingPage.platformComparison.labels", { min: 5, max: 5 }],
  ["pricingPage.faq.heading", { min: 2, max: 2 }],
]);

function mergeKnownShape(fallback: unknown, override: unknown, path = ""): unknown {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(override) || override.length === 0) return fallback;
    const size = fixedArraySizes.get(path);
    if (size && (override.length < size.min || override.length > size.max)) return fallback;
    if (fallback.length === 0) return override;
    return override.map((item, index) =>
      mergeKnownShape(fallback[index] ?? fallback[0], item, `${path}[]`),
    );
  }

  if (isRecord(fallback)) {
    if (!isRecord(override)) return fallback;
    return Object.fromEntries(
      Object.entries(fallback).map(([key, value]) => [
        key,
        mergeKnownShape(value, override[key], path ? `${path}.${key}` : key),
      ]),
    );
  }

  return typeof override === typeof fallback ? override : fallback;
}

export function getRepositoryMarketingSnapshot(
  locale: Locale,
): MarketingContentSnapshot {
  return {
    messages: getMarketingMessages(locale),
    presentation: getRepositoryMarketingPresentation(locale),
    source: "repository",
  };
}

/** Applies only known, type-compatible CMS fields over the repository fallback. */
export function applyContentfulMarketingPayload(
  locale: Locale,
  payload: unknown,
): MarketingContentSnapshot {
  const fallback = getRepositoryMarketingSnapshot(locale);
  if (!isRecord(payload)) return fallback;

  return {
    messages: fallback.messages,
    presentation: {
      brand: mergeKnownShape(
        fallback.presentation.brand,
        payload.brand,
        "brand",
      ) as MarketingPresentation["brand"],
      hero: mergeKnownShape(
        fallback.presentation.hero,
        payload.hero,
        "hero",
      ) as MarketingPresentation["hero"],
      testimonials: fallback.presentation.testimonials,
      navigation: mergeKnownShape(
        fallback.presentation.navigation,
        payload.navigation,
        "navigation",
      ) as MarketingPresentation["navigation"],
      footer: mergeKnownShape(
        fallback.presentation.footer,
        payload.footer,
        "footer",
      ) as MarketingPresentation["footer"],
      landingPage: mergeKnownShape(
        fallback.presentation.landingPage,
        payload.landingPage,
        "landingPage",
      ) as MarketingPresentation["landingPage"],
      pricingPage: mergeKnownShape(
        fallback.presentation.pricingPage,
        payload.pricingPage,
        "pricingPage",
      ) as MarketingPresentation["pricingPage"],
      legalPages: mergeKnownShape(
        fallback.presentation.legalPages,
        payload.legalPages,
        "legalPages",
      ) as MarketingPresentation["legalPages"],
      seoEntries: mergeKnownShape(
        fallback.presentation.seoEntries,
        payload.seoEntries,
        "seoEntries",
      ) as MarketingPresentation["seoEntries"],
    },
    source: "contentful",
  };
}
