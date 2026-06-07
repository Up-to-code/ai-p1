import { describe, expect, it } from "vitest";
import {
  readBoundedOptionalLimit,
  readWorkspaceListQuery,
  workspaceIndexedListReadJson,
  workspaceOrganizationReadJson,
  workspacePagedListReadJson,
} from "./workspace-read-surface";

function fakeContext(input: {
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
}) {
  return {
    req: {
      param: (name: string) => input.params?.[name],
      query: (name: string) => input.query?.[name],
    },
    json: (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status }),
  } as never;
}

describe("workspace read surface module", () => {
  it("parses list filters once for route handlers", async () => {
    const result = readWorkspaceListQuery(fakeContext({
      query: {
        limit: "25",
        cursor: "cursor_1",
        status: "approved",
        search: "tower",
      },
    }), "status", ["approved", "draft"] as const);

    expect(result).toEqual({
      ok: true,
      data: {
        paginationOpts: { numItems: 25, cursor: "cursor_1" },
        filter: "approved",
        search: "tower",
      },
    });
  });

  it("bounds optional limits without changing finite-number validation", () => {
    expect(readBoundedOptionalLimit(fakeContext({ query: { limit: "500" } }), 100)).toEqual({
      ok: true,
      data: 100,
    });

    const invalid = readBoundedOptionalLimit(fakeContext({ query: { limit: "many" } }), 100);
    expect(invalid.ok).toBe(false);
  });

  it("owns organization id parsing and response mapping", async () => {
    const response = await workspaceOrganizationReadJson(
      fakeContext({ params: { organizationId: "org_1" } }),
      "test read",
      async (organizationId) => ({ organizationId }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ organizationId: "org_1" });
  });

  it("runs paged list reads through one organization and filter interface", async () => {
    const response = await workspacePagedListReadJson(fakeContext({
      params: { organizationId: "org_1" },
      query: { limit: "25", cursor: "cursor_1", status: "approved", search: "tower" },
    }), {
      label: "projects list",
      filterName: "status",
      allowedFilters: ["approved", "draft"] as const,
      read: async (organizationId, query) => ({ organizationId, query }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      organizationId: "org_1",
      query: {
        paginationOpts: { numItems: 25, cursor: "cursor_1" },
        filter: "approved",
        search: "tower",
      },
    });
  });

  it("runs indexed reads with list and stats sharing the same parsed query", async () => {
    const response = await workspaceIndexedListReadJson(fakeContext({
      params: { organizationId: "org_1" },
      query: { limit: "10", type: "person" },
    }), {
      label: "clients index",
      filterName: "type",
      allowedFilters: ["person", "organization"] as const,
      readList: async (organizationId, query) => ({ organizationId, query }),
      readStats: async (organizationId) => ({ organizationId, total: 1 }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      list: {
        organizationId: "org_1",
        query: {
          paginationOpts: { numItems: 10, cursor: null },
          filter: "person",
          search: undefined,
        },
      },
      stats: { organizationId: "org_1", total: 1 },
    });
  });
});
