import { beforeEach, describe, expect, it, vi } from "vitest";

const canReadProject = vi.fn(() => true);
const canReadSpace = vi.fn(() => true);

vi.mock("./project", () => ({
  resolveProjectAccess: vi.fn(async () => ({ canRead: canReadProject })),
}));

vi.mock("./space", () => ({
  resolveSpaceAccess: vi.fn(async () => ({ canRead: canReadSpace })),
}));

import {
  assertCanReadSavedViewScope,
  filterReadableSavedViews,
} from "./savedView";

function record(id: string, organizationId = "org_1") {
  return {
    _id: id,
    _creationTime: 1,
    organizationId,
    recordState: "active",
  };
}

function context(records: Record<string, ReturnType<typeof record> | null>) {
  return {
    auth: {},
    runQuery: vi.fn(),
    db: {
      normalizeId: vi.fn((table: string, id: string) =>
        id.startsWith(table === "projects" ? "project_" : "space_") ? id : null,
      ),
      get: vi.fn(async (id: string) => records[id] ?? null),
    },
  };
}

function view(scopeType: "workspace" | "project" | "space", scopeId?: string) {
  return {
    ...record(`view_${scopeType}`),
    scopeType,
    scopeId,
  };
}

describe("Saved View scope access Interface", () => {
  beforeEach(() => {
    canReadProject.mockReset().mockReturnValue(true);
    canReadSpace.mockReset().mockReturnValue(true);
  });

  it("allows an Organization-level workspace view without a parent lookup", async () => {
    const ctx = context({});
    await expect(assertCanReadSavedViewScope(
      ctx as never,
      "org_1",
      { scopeType: "workspace" },
    )).resolves.toBeUndefined();
    expect(ctx.db.get).not.toHaveBeenCalled();
  });

  it("requires current read access to an active Project", async () => {
    const ctx = context({ project_1: record("project_1") });
    await expect(assertCanReadSavedViewScope(
      ctx as never,
      "org_1",
      { scopeType: "project", scopeId: "project_1" },
    )).resolves.toBeUndefined();

    canReadProject.mockReturnValue(false);
    await expect(assertCanReadSavedViewScope(
      ctx as never,
      "org_1",
      { scopeType: "project", scopeId: "project_1" },
    )).rejects.toMatchObject({ data: { code: "SAVED_VIEW_SCOPE_DENIED" } });
  });

  it("rejects malformed, deleted, and cross-Organization scopes", async () => {
    const deleted = { ...record("space_deleted"), recordState: "deleted" };
    const ctx = context({
      space_deleted: deleted,
      project_cross: record("project_cross", "org_2"),
    });

    await expect(assertCanReadSavedViewScope(
      ctx as never,
      "org_1",
      { scopeType: "space", scopeId: "bad" },
    )).rejects.toMatchObject({ data: { code: "SAVED_VIEW_SCOPE_INVALID" } });
    await expect(assertCanReadSavedViewScope(
      ctx as never,
      "org_1",
      { scopeType: "space", scopeId: "space_deleted" },
    )).rejects.toMatchObject({ data: { code: "SAVED_VIEW_SCOPE_INVALID" } });
    await expect(assertCanReadSavedViewScope(
      ctx as never,
      "org_1",
      { scopeType: "project", scopeId: "project_cross" },
    )).rejects.toMatchObject({ data: { code: "SAVED_VIEW_SCOPE_INVALID" } });
  });

  it("omits saved views whose parent access was revoked", async () => {
    canReadSpace.mockReturnValue(false);
    const ctx = context({ space_1: record("space_1") });
    const workspaceView = view("workspace");
    const revokedView = view("space", "space_1");

    await expect(filterReadableSavedViews(
      ctx as never,
      "org_1",
      [workspaceView, revokedView] as never,
    )).resolves.toEqual([workspaceView]);
  });
});
