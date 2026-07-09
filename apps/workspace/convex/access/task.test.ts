import { ConvexError } from "convex/values";
import { describe, expect, it, vi } from "vitest";

vi.mock("../auth", () => ({
  authUser: {
    safeGetAuthUser: vi.fn(async (ctx: { actorUserId?: string }) =>
      ctx.actorUserId ? { _id: ctx.actorUserId } : null,
    ),
  },
}));

import { resolveTaskAccess } from "./task";

type Role = "owner" | "admin" | "member" | null;
type ScopedRole = "admin" | "member" | "viewer";

function fakeCtx(input: {
  actorUserId?: string;
  organizationRole: Role;
  projectMemberships?: Array<{ projectId: string; role: ScopedRole }>;
  spaceMemberships?: Array<{ spaceId: string; role: ScopedRole }>;
  projectSpaceLinks?: Array<{ projectId: string; spaceId: string }>;
  records?: Record<string, Record<string, unknown>>;
}) {
  const rows = {
    projectMembers: (input.projectMemberships ?? []).map((row) => ({ ...row, recordState: "active" })),
    spaceMembers: (input.spaceMemberships ?? []).map((row) => ({ ...row, recordState: "active" })),
    projectSpaces: (input.projectSpaceLinks ?? []).map((row) => ({ ...row, recordState: "active" })),
  };
  const chain = { eq: () => chain };
  const tableRows = (table: keyof typeof rows) => rows[table] ?? [];
  return {
    actorUserId: input.actorUserId,
    auth: { getUserIdentity: async () => null },
    runQuery: vi.fn(async () => input.organizationRole ? { role: input.organizationRole, userId: input.actorUserId } : null),
    db: {
      get: vi.fn(async (id: string) => input.records?.[id] ?? null),
      query: vi.fn((table: keyof typeof rows) => ({
        withIndex: vi.fn((_name: string, build: (q: typeof chain) => unknown) => {
          build(chain);
          return {
            take: vi.fn(async () => tableRows(table)),
            first: vi.fn(async () => tableRows(table)[0] ?? null),
          };
        }),
      })),
    },
  };
}

function project(id: string, visibility: "private" | "space_members" | "organization" = "space_members") {
  return {
    _id: id, _creationTime: 1, organizationId: "org_1", name: id,
    ownerUserId: "project_owner", status: "active", health: "onTrack", visibility,
    recordState: "active", createdByUserId: "project_owner", createdAt: 1, updatedAt: 1,
  };
}

function space(id: string, visibility: "private" | "public" | "request_only" = "private") {
  return {
    _id: id, _creationTime: 1, organizationId: "org_1", name: id, slug: id,
    visibility, recordState: "active", createdByUserId: "space_owner", createdAt: 1, updatedAt: 1,
  };
}

function task(input: {
  id: string;
  organizationId?: string;
  visibility?: "private" | "team" | "workspace";
  createdByUserId?: string;
  assigneeUserId?: string;
  projectId?: string;
  spaceId?: string;
}) {
  return {
    _id: input.id, _creationTime: 1, organizationId: input.organizationId ?? "org_1",
    title: input.id, status: "todo" as const, priority: "normal" as const,
    visibility: input.visibility ?? "team", createdByUserId: input.createdByUserId ?? "creator",
    assigneeUserId: input.assigneeUserId, projectId: input.projectId, spaceId: input.spaceId,
    recordState: "active" as const, createdAt: 1, updatedAt: 1,
  };
}

describe("Task access Interface", () => {
  it("maps delete authority separately from Project update authority", async () => {
    const records = { project_1: project("project_1") };
    const matrix = [
      ["owner", "owner", undefined, true, true, true],
      ["organization_admin", "admin", undefined, true, true, false],
      ["project_admin", "member", "admin", true, true, true],
      ["member", "member", "member", true, true, false],
      ["viewer", "member", "viewer", true, false, false],
    ] as const;
    for (const [actorUserId, organizationRole, projectRole, canRead, canUpdate, canDelete] of matrix) {
      const access = await resolveTaskAccess(fakeCtx({
        actorUserId,
        organizationRole,
        projectMemberships: projectRole ? [{ projectId: "project_1", role: projectRole }] : [],
        records,
      }) as never, "org_1");
      const scoped = task({ id: "task_1", projectId: "project_1", visibility: "team" });
      expect(await access.canRead(scoped as never)).toBe(canRead);
      expect(await access.canUpdate(scoped as never)).toBe(canUpdate);
      expect(await access.canDelete(scoped as never)).toBe(canDelete);
    }
  });

  it("allows Space members to update but not delete Space-scoped tasks", async () => {
    const records = { space_1: space("space_1", "request_only") };
    const viewer = await resolveTaskAccess(fakeCtx({
      actorUserId: "viewer", organizationRole: "member",
      spaceMemberships: [{ spaceId: "space_1", role: "viewer" }], records,
    }) as never, "org_1");
    const member = await resolveTaskAccess(fakeCtx({
      actorUserId: "member", organizationRole: "member",
      spaceMemberships: [{ spaceId: "space_1", role: "member" }], records,
    }) as never, "org_1");
    const scoped = task({ id: "task_1", spaceId: "space_1", visibility: "team" });
    expect(await viewer.canRead(scoped as never)).toBe(true);
    expect(await viewer.canUpdate(scoped as never)).toBe(false);
    expect(await member.canUpdate(scoped as never)).toBe(true);
    expect(await member.canDelete(scoped as never)).toBe(false);
  });

  it("keeps a narrow private-task creator delete exception", async () => {
    const access = await resolveTaskAccess(fakeCtx({
      actorUserId: "creator", organizationRole: "member",
    }) as never, "org_1");
    const assigneeAccess = await resolveTaskAccess(fakeCtx({
      actorUserId: "assignee", organizationRole: "member",
    }) as never, "org_1");
    const privateTask = task({
      id: "private", visibility: "private", createdByUserId: "creator", assigneeUserId: "assignee",
    });
    expect(await access.canDelete(privateTask as never)).toBe(true);
    expect(await assigneeAccess.canDelete(privateTask as never)).toBe(false);
  });

  it("filters My Tasks and aggregate inputs before any caller can expose private work", async () => {
    const access = await resolveTaskAccess(fakeCtx({ actorUserId: "actor", organizationRole: "member" }) as never, "org_1");
    const visibleMine = task({ id: "mine", visibility: "private", assigneeUserId: "actor" });
    const hiddenOther = task({ id: "other", visibility: "private", assigneeUserId: "other" });
    const visibleWorkspace = task({ id: "workspace", visibility: "workspace" });
    expect((await access.filterReadable([visibleMine, hiddenOther, visibleWorkspace] as never)).map((row) => row._id)).toEqual(["mine", "workspace"]);
  });

  it("fails closed for oversized visibility, invalid linked scope, cross-org records, and revoked membership", async () => {
    const records = {
      private_project: project("private_project", "private"),
      foreign_project: { ...project("foreign_project"), organizationId: "org_2" },
    };
    const member = await resolveTaskAccess(fakeCtx({
      actorUserId: "member", organizationRole: "member",
      projectMemberships: [{ projectId: "private_project", role: "member" }], records,
    }) as never, "org_1");
    await expect(member.assertCanCreate({ projectId: "private_project", visibility: "workspace" })).rejects.toBeInstanceOf(ConvexError);
    expect(await member.canRead(task({ id: "oversized", projectId: "private_project", visibility: "workspace" }) as never)).toBe(false);
    await expect(member.assertValidLinks({ projectId: "foreign_project" })).rejects.toBeInstanceOf(ConvexError);
    await expect(member.assertValidLinks({ projectId: "private_project", spaceId: "foreign_project" })).rejects.toBeInstanceOf(ConvexError);
    expect(await member.canRead(task({ id: "foreign", organizationId: "org_2", visibility: "workspace" }) as never)).toBe(false);
    await expect(resolveTaskAccess(fakeCtx({ actorUserId: "revoked", organizationRole: null }) as never, "org_1")).rejects.toBeInstanceOf(ConvexError);
  });
});
