import "server-only";

import type { Locale } from "@/lib/content";
import {
  applyContentfulMarketingPayload,
  getRepositoryMarketingSnapshot,
  type MarketingContentSnapshot,
} from "@/lib/contentful-payload";
import { extractContentfulMarketingSitePayload } from "@/lib/contentful-marketing-site";

const CONTENTFUL_CACHE_TAG = "contentful-marketing";
const DEFAULT_CONTENT_TYPE = "qentrahFooterBlock";
const DEFAULT_ENVIRONMENT = "master";
const DEFAULT_REVALIDATE_SECONDS = 3600;

type ContentfulConfig = {
  accessToken: string;
  contentType: string;
  environment: string;
  host: "cdn.contentful.com" | "preview.contentful.com";
  revalidateSeconds: number;
  spaceId: string;
};

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function contentfulConfig(): ContentfulConfig | null {
  const spaceId = process.env.CONTENTFUL_SPACE_ID?.trim();
  const usePreview = process.env.CONTENTFUL_USE_PREVIEW === "true";
  const accessToken = (
    usePreview
      ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
      : process.env.CONTENTFUL_ACCESS_TOKEN
  )?.trim();

  if (!spaceId || !accessToken) return null;

  return {
    accessToken,
    contentType:
      process.env.CONTENTFUL_MARKETING_CONTENT_TYPE?.trim() ||
      DEFAULT_CONTENT_TYPE,
    environment:
      process.env.CONTENTFUL_ENVIRONMENT?.trim() || DEFAULT_ENVIRONMENT,
    host: usePreview ? "preview.contentful.com" : "cdn.contentful.com",
    revalidateSeconds: positiveInteger(
      process.env.CONTENTFUL_REVALIDATE_SECONDS,
      DEFAULT_REVALIDATE_SECONDS,
    ),
    spaceId,
  };
}

function contentfulEntriesUrl(config: ContentfulConfig, locale: Locale) {
  const url = new URL(
    `https://${config.host}/spaces/${encodeURIComponent(config.spaceId)}/environments/${encodeURIComponent(config.environment)}/entries`,
  );
  url.searchParams.set("content_type", config.contentType);
  url.searchParams.set("fields.locale", locale);
  url.searchParams.set("limit", "1");
  url.searchParams.set("include", "5");
  return url;
}

/** Reads published localized Marketing content and fails safely to repository copy. */
export async function getMarketingContent(
  locale: Locale,
): Promise<MarketingContentSnapshot> {
  const config = contentfulConfig();
  if (!config) return getRepositoryMarketingSnapshot(locale);

  try {
    const response = await fetch(contentfulEntriesUrl(config, locale), {
      headers: { Authorization: `Bearer ${config.accessToken}` },
      next: {
        revalidate: config.revalidateSeconds,
        tags: [CONTENTFUL_CACHE_TAG, `${CONTENTFUL_CACHE_TAG}:${locale}`],
      },
    });
    if (!response.ok) return getRepositoryMarketingSnapshot(locale);

    const payload = extractContentfulMarketingSitePayload(await response.json());
    return payload === null
      ? getRepositoryMarketingSnapshot(locale)
      : applyContentfulMarketingPayload(locale, payload);
  } catch {
    return getRepositoryMarketingSnapshot(locale);
  }
}

export { CONTENTFUL_CACHE_TAG };
export type { MarketingContentSnapshot };
