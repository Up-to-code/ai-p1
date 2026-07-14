import { v } from "convex/values";
import { internalAction, type ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { SearchPolicy, SearchProjection } from "@qentrah/domain-contracts";
import { searchIndexName, shouldExternallyIndex } from "./indexPolicy";

const SETTINGS_VERSION = 2;
const MAX_BATCH_SIZE = 25;
const SEARCHABLE_ATTRIBUTES = ["title", "subtitle", "identifier", "searchText", "keywords"];
const FILTERABLE_ATTRIBUTES = ["organizationId", "resourceType", "scopeType", "spaceIds", "projectIds", "principalKeys", "sensitivity", "locale", "ownerIds", "assigneeIds", "clientIds", "statuses", "tagIds", "dateValue"];

function runtimeConfig() {
  const baseUrl = process.env.MEILISEARCH_URL?.trim() ?? "";
  const apiKey = process.env.MEILISEARCH_API_KEY?.trim() ?? "";
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey, indexPrefix: process.env.MEILISEARCH_INDEX_PREFIX?.trim() || "qentrah_search" };
}

async function providerRequest(config: ReturnType<typeof runtimeConfig>, path: string, init: RequestInit) {
  const response = await fetch(`${config.baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", ...init.headers } });
  if (!response.ok) throw new Error(`Search provider request failed (${response.status}).`);
}

export const processBatch = internalAction({
  args: {},
  returns: v.object({ configured: v.boolean(), processed: v.number(), failed: v.number() }),
  handler: async (ctx) => {
    const config = runtimeConfig();
    if (!config.baseUrl || !config.apiKey) return { configured: false, processed: 0, failed: 0 };
    let processed = 0;
    let failed = 0;
    for (let index = 0; index < MAX_BATCH_SIZE; index += 1) {
      const now = Date.now();
      const event = await ctx.runMutation(internal.search.outbox.claimNext, { now });
      if (!event) break;
      try {
        const projection = await ctx.runQuery(internal.search.outbox.loadProjection, {
          organizationId: event.organizationId,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          version: event.projectionVersion,
        }) as SearchProjection | null;
        if (projection) {
          const policy = await ctx.runQuery(internal.search.outbox.loadPolicy, { organizationId: event.organizationId }) as SearchPolicy | null;
          const indexName = searchIndexName(config.indexPrefix, projection.locale);
          await ensureIndexSettings(ctx, config, indexName);
          const path = `/indexes/${encodeURIComponent(indexName)}/documents`;
          if (event.operation === "delete" || !shouldExternallyIndex(projection, policy)) {
            await providerRequest(config, `${path}/delete-batch`, { method: "POST", body: JSON.stringify([`${projection.organizationId}:${projection.resourceType}:${projection.resourceId}`]) });
          } else {
            await providerRequest(config, `${path}?primaryKey=id`, { method: "POST", body: JSON.stringify([{ id: `${projection.organizationId}:${projection.resourceType}:${projection.resourceId}`, ...projection }]) });
          }
        }
        await ctx.runMutation(internal.search.outbox.complete, { eventId: event._id, now: Date.now() });
        processed += 1;
      } catch (error) {
        await ctx.runMutation(internal.search.outbox.fail, { eventId: event._id, now: Date.now(), error: error instanceof Error ? error.message : "Search indexing failed." });
        failed += 1;
      }
    }
    return { configured: true, processed, failed };
  },
});

async function ensureIndexSettings(
  ctx: ActionCtx,
  config: ReturnType<typeof runtimeConfig>,
  indexName: string,
) {
  const version = await ctx.runQuery(internal.search.outbox.indexSettingsVersion, { indexName });
  if (version === SETTINGS_VERSION) return;
  await providerRequest(config, `/indexes/${encodeURIComponent(indexName)}/settings`, { method: "PATCH", body: JSON.stringify({ searchableAttributes: SEARCHABLE_ATTRIBUTES, filterableAttributes: FILTERABLE_ATTRIBUTES, displayedAttributes: ["resourceType", "resourceId", "version", "title", "searchText"] }) });
  await ctx.runMutation(internal.search.outbox.markIndexConfigured, { indexName, settingsVersion: SETTINGS_VERSION, now: Date.now() });
}
