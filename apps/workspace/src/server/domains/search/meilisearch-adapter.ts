import type { SearchCandidate, SearchProjection, SearchProvider, SearchQuery } from "@qentrah/domain-contracts";
import { searchDocumentKey } from "./search-provider";

type Config = { baseUrl: string; apiKey: string; indexPrefix: string; fetcher?: typeof fetch };

export class MeilisearchSearchAdapter implements SearchProvider {
  constructor(private readonly config: Config) {}

  async upsert(projections: SearchProjection[]) {
    if (!projections.length) return;
    const grouped = Map.groupBy(projections, (projection) => `${this.config.indexPrefix}_${projection.locale}`);
    await Promise.all([...grouped].map(([index, records]) => this.request(`/indexes/${encodeURIComponent(index)}/documents?primaryKey=id`, { method: "POST", body: JSON.stringify(records.map((record) => ({ id: searchDocumentKey(record.organizationId, record.resourceType, record.resourceId), ...record }))) })));
  }

  async remove(projections: Array<Pick<SearchProjection, "organizationId" | "resourceType" | "resourceId" | "locale">>) {
    const grouped = Map.groupBy(projections, (projection) => `${this.config.indexPrefix}_${projection.locale}`);
    await Promise.all([...grouped].map(([index, records]) => this.request(`/indexes/${encodeURIComponent(index)}/documents/delete-batch`, { method: "POST", body: JSON.stringify(records.map((record) => searchDocumentKey(record.organizationId, record.resourceType, record.resourceId))) })));
  }

  async search(query: SearchQuery): Promise<SearchCandidate[]> {
    const filters = [`organizationId = ${JSON.stringify(query.organizationId)}`, `principalKeys IN [${query.principalKeys.map((key) => JSON.stringify(key)).join(",")}]`, `sensitivity IN [${query.sensitivity.map((value) => JSON.stringify(value)).join(",")}]`];
    if (query.resourceTypes?.length) filters.push(`resourceType IN [${query.resourceTypes.map((value) => JSON.stringify(value)).join(",")}]`);
    if (query.scopeTypes?.length) filters.push(`scopeType IN [${query.scopeTypes.map((value) => JSON.stringify(value)).join(",")}]`);
    addArrayFilter(filters, "spaceIds", query.spaceIds);
    addArrayFilter(filters, "projectIds", query.projectIds);
    addArrayFilter(filters, "ownerIds", query.ownerIds);
    addArrayFilter(filters, "assigneeIds", query.assigneeIds);
    addArrayFilter(filters, "clientIds", query.clientIds);
    addArrayFilter(filters, "statuses", query.statuses);
    addArrayFilter(filters, "tagIds", query.tagIds);
    if (query.dateFrom !== undefined) filters.push(`dateValue >= ${query.dateFrom}`);
    if (query.dateTo !== undefined) filters.push(`dateValue <= ${query.dateTo}`);
    const results = await Promise.all(query.locales.map(async (locale) => {
      const response = await this.request<{ hits: Array<{ resourceType: SearchCandidate["resourceType"]; resourceId: string; version: number; _rankingScore?: number; _formatted?: { title?: string; searchText?: string } }> }>(`/indexes/${encodeURIComponent(`${this.config.indexPrefix}_${locale}`)}/search`, { method: "POST", body: JSON.stringify({ q: query.text, filter: filters, limit: query.limit, offset: query.offset ?? 0, showRankingScore: true, attributesToHighlight: ["title", "searchText"], highlightPreTag: "<mark>", highlightPostTag: "</mark>" }) });
      return response.hits.map((hit) => ({ resourceType: hit.resourceType, resourceId: hit.resourceId, version: hit.version, score: hit._rankingScore ?? 0, titleSnippet: hit._formatted?.title, textSnippet: hit._formatted?.searchText }));
    }));
    return results.flat().sort((a, b) => b.score - a.score).slice(0, query.limit);
  }

  private async request<T = unknown>(path: string, init: RequestInit): Promise<T> {
    const response = await (this.config.fetcher ?? fetch)(`${this.config.baseUrl.replace(/\/$/, "")}${path}`, { ...init, headers: { "Authorization": `Bearer ${this.config.apiKey}`, "Content-Type": "application/json", ...init.headers }, cache: "no-store" });
    if (!response.ok) throw new Error(`Search provider request failed (${response.status}).`);
    return response.json() as Promise<T>;
  }
}

function addArrayFilter(filters: string[], attribute: string, values?: string[]) {
  if (values?.length) filters.push(`${attribute} IN [${values.map((value) => JSON.stringify(value)).join(",")}]`);
}
