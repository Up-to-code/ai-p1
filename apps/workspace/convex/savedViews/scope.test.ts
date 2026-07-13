import { describe, expect, it, vi } from "vitest";
import { assertSavedViewScope } from "./write";

function context(record: Record<string, unknown> | null) {
  return {
    db: {
      normalizeId: vi.fn((_table: string, id: string) => id.startsWith("bad") ? null : id),
      get: vi.fn(async () => record),
    },
  } as never;
}

describe("saved-view scope", () => {
  it("accepts an active record in the selected Organization", async () => {
    await expect(assertSavedViewScope(
      context({ organizationId: "org_1", recordState: "active" }),
      "org_1",
      { scopeType: "project", scopeId: "project_1" },
    )).resolves.toBeUndefined();
  });

  it("rejects malformed, cross-Organization, and deleted scope records", async () => {
    await expect(assertSavedViewScope(context(null), "org_1", { scopeType: "project", scopeId: "bad-id" })).rejects.toThrow("scope is invalid");
    await expect(assertSavedViewScope(context({ organizationId: "org_2", recordState: "active" }), "org_1", { scopeType: "project", scopeId: "project_2" })).rejects.toThrow("active record in this organization");
    await expect(assertSavedViewScope(context({ organizationId: "org_1", recordState: "deleted" }), "org_1", { scopeType: "space", scopeId: "space_1" })).rejects.toThrow("active record in this organization");
  });
});
