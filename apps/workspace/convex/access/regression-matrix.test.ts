import { ConvexError } from "convex/values";
import { describe, expect, it, vi } from "vitest";

vi.mock("../auth", () => ({
  authUser: {
    safeGetAuthUser: vi.fn(async (ctx: { actorUserId?: string }) =>
      ctx.actorUserId ? { _id: ctx.actorUserId } : null,
    ),
  },
}));

vi.mock("../permissions", () => ({
  getOrganizationRole: vi.fn(
    async (ctx: { organizationRole?: string }) => ctx.organizationRole ?? null,
  ),
  hasOrganizationMembership: vi.fn(
    async (
      ctx: { organizationMembers?: string[] },
      _organizationId: string,
      userId: string,
    ) => ctx.organizationMembers?.includes(userId) ?? false,
  ),
  canPerformOrganizationAction: vi.fn(
    async (
      ctx: { organizationRole?: string },
      _organizationId: string,
      _userId: string,
      _resource: string,
      action: string,
    ) => {
      if (ctx.organizationRole === "owner") return true;
      if (ctx.organizationRole === "admin") return action !== "delete";
      return action === "read";
    },
  ),
}));

import { resolveChannelAccess } from "./channel";
import { resolveDocumentAccess } from "./document";
import { resolveProjectAccess } from "./project";
import { resolveSpaceAccess } from "./space";
import { resolveTaskAccess } from "./task";

type Role = "owner" | "admin" | "member" | null;
type ScopedRole = "admin" | "member" | "viewer";

type Fixture = {
  actorUserId?: string;
  organizationRole: Role;
  organizationMembers?: string[];
  projectRole?: ScopedRole;
  spaceRole?: ScopedRole;
  records?: Record<string, Record<string, unknown>>;
};

function project(id = "project_1", input: Record<string, unknown> = {}) {
  return {
    _id: id,
    _creationTime: 1,
    organizationId: "org_1",
    name: id,
    ownerUserId: "project_owner",
    status: "active",
    health: "onTrack",
    visibility: "space_members",
    recordState: "active",
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

function space(id = "space_1", input: Record<string, unknown> = {}) {
  return {
    _id: id,
    _creationTime: 1,
    organizationId: "org_1",
    name: id,
    slug: id,
    visibility: "private",
    recordState: "active",
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

function task(id = "task_1", input: Record<string, unknown> = {}) {
  return {
    _id: id,
    _creationTime: 1,
    organizationId: "org_1",
    title: id,
    status: "todo",
    priority: "normal",
    visibility: "team",
    createdByUserId: "creator",
    assigneeUserId: undefined,
    projectId: "project_1",
    spaceId: undefined,
    recordState: "active",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

function document(id = "doc_1", input: Record<string, unknown> = {}) {
  return {
    _id: id,
    _creationTime: 1,
    organizationId: "org_1",
    title: id,
    projectId: "project_1",
    visibility: "workspace",
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

function channel(input: Record<string, unknown> = {}) {
  return {
    _id: "channel_1",
    _creationTime: 1,
    id: "channel_1",
    organizationId: "org_1",
    name: "Channel",
    type: "project",
    visibility: "public",
    memberIds: ["actor"],
    projectId: "project_1",
    createdBy: "actor",
    createdAt: 1,
    updatedAt: 1,
    ...input,
  };
}

function fakeCtx(input: Fixture) {
  const records: Record<string, Record<string, unknown>> = {
    project_1: project(),
    space_1: space(),
    ...(input.records ?? {}),
  };
  const rows = {
    projectMembers: input.projectRole
      ? [{ projectId: "project_1", role: input.projectRole, recordState: "active" }]
      : [],
    spaceMembers: input.spaceRole
      ? [{ spaceId: "space_1", role: input.spaceRole, recordState: "active" }]
      : [],
    projectSpaces: [
      { projectId: "project_1", spaceId: "space_1", recordState: "active" },
    ],
  };
  const chain = { eq: () => chain };

  return {
    actorUserId: input.actorUserId,
    organizationRole: input.organizationRole,
    organizationMembers: input.organizationMembers,
    auth: { getUserIdentity: async () => null },
    runQuery: vi.fn(),
    db: {
      normalizeId: vi.fn((table: string, value: string) =>
        value.startsWith(table.slice(0, -1)) ? value : null,
      ),
      get: vi.fn(async (id: string) => records[id] ?? null),
      query: vi.fn((table: keyof typeof rows) => ({
        withIndex: vi.fn(
          (_name: string, build: (q: typeof chain) => unknown) => {
            build(chain);
            return {
              take: vi.fn(async () => rows[table] ?? []),
              first: vi.fn(async () => (rows[table] ?? [])[0] ?? null),
            };
          },
        ),
      })),
    },
  };
}

describe("Trust Foundation cross-domain authorization matrix", () => {
  it.each([
    ["owner", "owner", undefined, undefined, true, true, true],
    ["organization admin", "admin", undefined, undefined, true, true, false],
    ["project member", "member", "member", undefined, true, true, false],
    ["project viewer", "member", "viewer", undefined, true, false, false],
  ] as const)(
    "%s keeps Project, Task, Document, and Channel decisions aligned",
    async (_label, organizationRole, projectRole, spaceRole, canRead, canUpdate, canDelete) => {
      const ctx = fakeCtx({
        actorUserId: "actor",
        organizationRole,
        organizationMembers: ["actor"],
        projectRole,
        spaceRole,
      });
      const projectAccess = await resolveProjectAccess(ctx as never, "org_1");
      const taskAccess = await resolveTaskAccess(ctx as never, "org_1");
      const documentAccess = await resolveDocumentAccess(ctx as never, "org_1");
      const channelAccess = await resolveChannelAccess(ctx as never, "org_1");

      expect(projectAccess.canRead(project() as never)).toBe(canRead);
      expect(projectAccess.canUpdate(project() as never)).toBe(canUpdate);
      expect(projectAccess.canDelete(project() as never)).toBe(canDelete);
      expect(await taskAccess.canRead(task() as never)).toBe(canRead);
      expect(await taskAccess.canUpdate(task() as never)).toBe(canUpdate);
      expect(await taskAccess.canDelete(task() as never)).toBe(canDelete);
      expect(await documentAccess.canReadDocument(document() as never)).toBe(canRead);
      expect(await documentAccess.canUpdateDocument(document() as never)).toBe(canUpdate);
      expect(await channelAccess.canRead(channel() as never)).toBe(canRead);
      expect(await channelAccess.canPost(channel() as never)).toBe(canUpdate);
      expect(await channelAccess.canDelete(channel() as never)).toBe(canDelete);
    },
  );

  it.each([
    { label: "cross-organization", change: { organizationId: "org_2" } },
    { label: "deleted", change: { deletedAt: 1, recordState: "deleted" } },
  ])("filters $label records in every resource adapter", async ({ change }) => {
    const ctx = fakeCtx({
      actorUserId: "actor",
      organizationRole: "owner",
      organizationMembers: ["actor"],
      records: {
        project_1: project("project_1", change),
        space_1: space("space_1", change),
      },
    });
    const projectAccess = await resolveProjectAccess(ctx as never, "org_1");
    const spaceAccess = await resolveSpaceAccess(ctx as never, "org_1");
    const taskAccess = await resolveTaskAccess(ctx as never, "org_1");
    const documentAccess = await resolveDocumentAccess(ctx as never, "org_1");
    const channelAccess = await resolveChannelAccess(ctx as never, "org_1");

    const invalidProject = project("project_1", change);
    const invalidSpace = space("space_1", change);
    const invalidTask = task("task_1", change);
    const invalidDocument = document("doc_1", change);
    const invalidChannel = channel(change);

    expect(projectAccess.filterReadable([invalidProject] as never)).toEqual([]);
    expect(spaceAccess.filterReadable([invalidSpace] as never)).toEqual([]);
    expect(await taskAccess.filterReadable([invalidTask] as never)).toEqual([]);
    expect(await documentAccess.filterReadableDocuments([invalidDocument] as never)).toEqual([]);
    expect(await channelAccess.filterReadable([invalidChannel] as never)).toEqual([]);
  });

  it("fails closed for outsiders and revoked Organization membership", async () => {
    for (const actorUserId of ["outsider", "revoked"]) {
      const ctx = fakeCtx({ actorUserId, organizationRole: null, organizationMembers: [] });
      await expect(resolveSpaceAccess(ctx as never, "org_1")).rejects.toBeInstanceOf(ConvexError);
      await expect(resolveProjectAccess(ctx as never, "org_1")).rejects.toBeInstanceOf(ConvexError);
      await expect(resolveTaskAccess(ctx as never, "org_1")).rejects.toBeInstanceOf(ConvexError);
      await expect(resolveDocumentAccess(ctx as never, "org_1")).rejects.toBeInstanceOf(ConvexError);
      await expect(resolveChannelAccess(ctx as never, "org_1")).rejects.toBeInstanceOf(ConvexError);
    }
  });
});
