import { describe, expect, it, vi } from "vitest";
import { MeilisearchSearchAdapter } from "./meilisearch-adapter";

describe("Meilisearch search Adapter", () => {
  it("keeps credentials server-side and applies tenant, principal, sensitivity, type, and locale filters", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ hits: [{ resourceType: "task", resourceId: "task_1", version: 3, _rankingScore: 0.75 }] }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const adapter = new MeilisearchSearchAdapter({ baseUrl: "https://search.test/", apiKey: "admin-secret", indexPrefix: "qentrah", fetcher });
    const result = await adapter.search({
      organizationId: "org_1", text: "alpha", principalKeys: ["user:user_1"], resourceTypes: ["task"], locales: ["ar"], sensitivity: ["standard"], limit: 10,
      scopeTypes: ["project"], projectIds: ["project_1"], assigneeIds: ["user:user_1"], statuses: ["active"], tagIds: ["urgent"], dateFrom: 10, dateTo: 20,
    });

    expect(result).toEqual([{ resourceType: "task", resourceId: "task_1", version: 3, score: 0.75 }]);
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://search.test/indexes/qentrah_ar/search");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer admin-secret");
    const body = JSON.parse(String(init.body));
    expect(body.filter).toEqual(expect.arrayContaining([
      "organizationId = \"org_1\"",
      "principalKeys IN [\"user:user_1\"]",
      "sensitivity IN [\"standard\"]",
      "resourceType IN [\"task\"]",
      "scopeType IN [\"project\"]",
      "projectIds IN [\"project_1\"]",
      "assigneeIds IN [\"user:user_1\"]",
      "statuses IN [\"active\"]",
      "tagIds IN [\"urgent\"]",
      "dateValue >= 10",
      "dateValue <= 20",
    ]));
  });
});
