import { describe, expect, it, vi } from "vitest";
import {
  assertToolCallInScope,
  normalizeMcpScope,
  projectVisibilityForMcpCreate,
  resolveScopePolicy,
  scopePolicyContext,
  type EffectiveScopePolicy,
} from "./scopePolicy";

function policy(type: "organization" | "space" | "project"): EffectiveScopePolicy {
  return {
    organizationId: "org_1",
    actorUserId: "user_1",
    scope: type === "organization"
      ? { type }
      : type === "space"
        ? { type, spaceIds: ["space_1" as never] }
        : { type, projectIds: ["project_1" as never] },
    spaceIds: type === "organization" ? [] : ["space_1" as never],
    projectIds: type === "organization" ? [] : ["project_1" as never],
    clientIds: type === "organization" ? [] : ["client_1" as never],
  };
}

function fakeCtx(records: Record<string, Record<string, unknown>> = {}) {
  return {
    auth: { getUserIdentity: vi.fn(async () => null) },
    runQuery: vi.fn(async () => ({ role: "member" })),
    db: {
      get: vi.fn(async (id: string) => records[id] ?? null),
    },
  };
}

describe("MCP ScopePolicy", () => {
  it("requires an explicit, structurally valid stored scope", () => {
    expect(normalizeMcpScope(undefined)).toEqual({ type: "organization" });
    expect(() => normalizeMcpScope({ type: "space", spaceIds: [] })).toThrow();
    expect(() => normalizeMcpScope({ type: "organization", projectIds: ["project_1" as never] })).toThrow();
  });

  it("creates a typed server-owned execution context", () => {
    expect(scopePolicyContext(policy("project"))).toEqual({
      organizationId: "org_1",
      actorUserId: "user_1",
      scopeType: "project",
      spaceIds: ["space_1"],
      projectIds: ["project_1"],
      clientIds: ["client_1"],
    });
  });

  it("never broadens a Space-scoped Project to Organization visibility", () => {
    expect(projectVisibilityForMcpCreate("space", "private")).toBe("private");
    expect(projectVisibilityForMcpCreate("space", "space_members")).toBe("space_members");
    expect(projectVisibilityForMcpCreate("space", "organization")).toBe("space_members");
    expect(projectVisibilityForMcpCreate("space", undefined)).toBe("space_members");
    expect(projectVisibilityForMcpCreate("organization", undefined)).toBe("organization");
  });

  it.each(["spaces_list", "projects_list", "tasks_list"])(
    "allows omitted list filters because handlers consume the effective scope: %s",
    async (tool) => {
      await expect(assertToolCallInScope(fakeCtx() as never, policy("space"), tool, {})).resolves.toBeUndefined();
      await expect(assertToolCallInScope(fakeCtx() as never, policy("project"), tool, {})).resolves.toBeUndefined();
    },
  );

  it("allows Organization-scoped list/get/create/update/delete calls", async () => {
    const ctx = fakeCtx();
    for (const [tool, input] of [
      ["projects_list", {}],
      ["projects_get", { projectId: "anything" }],
      ["projects_create", { name: "New" }],
      ["projects_update", { projectId: "anything" }],
      ["projects_delete", { projectId: "anything" }],
    ] as const) {
      await expect(assertToolCallInScope(ctx as never, policy("organization"), tool, input)).resolves.toBeUndefined();
    }
  });

  it.each([
    ["spaces_get", { spaceId: "space_1" }],
    ["spaces_update", { spaceId: "space_1" }],
    ["spaces_delete", { spaceId: "space_1" }],
    ["projects_get", { projectId: "project_1" }],
    ["projects_update", { projectId: "project_1" }],
    ["projects_delete", { projectId: "project_1" }],
    ["tasks_create", { projectId: "project_1" }],
  ] as const)("allows in-scope Space/Project CRUD: %s", async (tool, input) => {
    const ctx = fakeCtx({
      space_1: { organizationId: "org_1", recordState: "active" },
      project_1: { organizationId: "org_1", recordState: "active" },
    });
    await expect(assertToolCallInScope(ctx as never, policy("space"), tool, input)).resolves.toBeUndefined();
  });

  it("rejects out-of-scope IDs and cross-Organization targets", async () => {
    const ctx = fakeCtx({
      project_2: { organizationId: "org_1", recordState: "active" },
      project_cross: { organizationId: "org_2", recordState: "active" },
    });
    await expect(assertToolCallInScope(ctx as never, policy("project"), "projects_get", { projectId: "project_2" })).rejects.toMatchObject({
      data: { code: "MCP_SCOPE_DENIED" },
    });
    await expect(assertToolCallInScope(ctx as never, policy("project"), "projects_delete", { projectId: "project_cross" })).rejects.toMatchObject({
      data: { code: "MCP_SCOPE_DENIED" },
    });
  });

  it("does not widen narrow scope when a create target is omitted", async () => {
    await expect(assertToolCallInScope(fakeCtx() as never, policy("space"), "tasks_create", { title: "No target" })).rejects.toMatchObject({
      data: { code: "MCP_SCOPE_DENIED" },
    });
    await expect(assertToolCallInScope(fakeCtx() as never, policy("project"), "deals_create", { title: "No target" })).rejects.toMatchObject({
      data: { code: "MCP_SCOPE_DENIED" },
    });
    const ctx = fakeCtx({ space_1: { organizationId: "org_1", recordState: "active" } });
    await expect(assertToolCallInScope(ctx as never, policy("project"), "tasks_create", { spaceId: "space_1" })).rejects.toMatchObject({
      data: { code: "MCP_SCOPE_DENIED" },
    });
  });

  it("reacts to revoked creator Organization access on the next resolution", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn(async () => null) },
      runQuery: vi.fn(async () => null),
      db: { get: vi.fn(), query: vi.fn() },
    };
    await expect(resolveScopePolicy(ctx as never, {
      organizationId: "org_1",
      actorUserId: "revoked_user",
      scope: { type: "organization" },
    })).rejects.toMatchObject({ data: { code: "MCP_SCOPE_ACCESS_REVOKED" } });
  });

  it("rejects a cross-Organization Project in a selected connection scope", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn(async () => null) },
      runQuery: vi.fn(async () => ({ role: "owner" })),
      db: {
        get: vi.fn(async () => ({
          _id: "project_cross",
          organizationId: "org_2",
          recordState: "active",
        })),
        query: vi.fn(),
      },
    };
    await expect(resolveScopePolicy(ctx as never, {
      organizationId: "org_1",
      actorUserId: "user_1",
      scope: { type: "project", projectIds: ["project_cross" as never] },
    })).rejects.toMatchObject({ data: { code: "MCP_SCOPE_ACCESS_REVOKED" } });
  });
});
