import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SearchProvider } from "@qentrah/domain-contracts";
import { fetchAuthQuery } from "@/server/auth/auth-request";
import { searchAuthorizedResources } from "./search-service";

vi.mock("@convex/_generated/api", () => ({ api: { search: { accessContext: { resolve: "search.context" }, hydrate: { candidates: "search.hydrate" } } } }));
vi.mock("@/server/auth/auth-request", () => ({ fetchAuthQuery: vi.fn() }));

const query = vi.mocked(fetchAuthQuery);
const provider: SearchProvider = {
  upsert: vi.fn(),
  remove: vi.fn(),
  search: vi.fn(),
};

describe("authorized search service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("intersects requested types and sends only candidate identities to Convex", async () => {
    query
      .mockResolvedValueOnce({ principalKeys: ["user:user_1"], locales: ["ar", "en"], resourceTypes: ["task"], sensitivity: ["standard"], policyVersion: 2 })
      .mockResolvedValueOnce([{ resourceType: "task", resourceId: "task_1", title: "Live title", route: "/tasks/task_1", score: 0.8, capabilities: { canRead: true, canUpdate: false, canDelete: false } }]);
    vi.mocked(provider.search).mockResolvedValueOnce([{ resourceType: "task", resourceId: "task_1", version: 4, score: 0.8, titleSnippet: "Untrusted external title" }]);

    const result = await searchAuthorizedResources(provider, "org_1", { search: "مشروع", resourceTypes: ["task", "project"], scopeTypes: ["project"], projectIds: ["project_1"], limit: 10 });

    expect(provider.search).toHaveBeenCalledWith(expect.objectContaining({ organizationId: "org_1", resourceTypes: ["task"], principalKeys: ["user:user_1"], locales: ["ar", "en"], scopeTypes: ["project"], projectIds: ["project_1"] }));
    expect(query).toHaveBeenLastCalledWith("search.hydrate", { organizationId: "org_1", candidates: [{ resourceType: "task", resourceId: "task_1", version: 4, score: 0.8 }] });
    expect(result[0]?.title).toBe("Live title");
    expect(JSON.stringify(result)).not.toContain("Untrusted external title");
  });

  it("does not query the provider when policy permits no requested types", async () => {
    query.mockResolvedValueOnce({ principalKeys: ["user:user_1"], locales: ["en"], resourceTypes: ["task"], sensitivity: ["standard"], policyVersion: 1 });
    await expect(searchAuthorizedResources(provider, "org_1", { search: "alpha", resourceTypes: ["project"], limit: 10 })).resolves.toEqual([]);
    expect(provider.search).not.toHaveBeenCalled();
  });
});
