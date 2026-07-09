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
      if (ctx.organizationRole === "member")
        return action === "create" || action === "read";
      return false;
    },
  ),
}));

vi.mock("./space", () => ({
  resolveSpaceAccess: vi.fn(async (ctx: { spaceRole?: string }) => ({
    canRead: () => Boolean(ctx.spaceRole),
    canUpdate: () => ctx.spaceRole === "admin" || ctx.spaceRole === "member",
  })),
}));

vi.mock("./project", () => ({
  resolveProjectAccess: vi.fn(async (ctx: { projectRole?: string }) => ({
    canRead: () => Boolean(ctx.projectRole),
    canUpdate: () =>
      ctx.projectRole === "admin" || ctx.projectRole === "member",
    canDelete: () => ctx.projectRole === "admin",
  })),
}));

import { resolveChannelAccess } from "./channel";

function fakeCtx(input: {
  actorUserId?: string;
  organizationRole?: "owner" | "admin" | "member";
  organizationMembers?: string[];
  spaceRole?: "admin" | "member" | "viewer";
  projectRole?: "admin" | "member" | "viewer";
}) {
  const records: Record<string, Record<string, unknown>> = {
    space_1: { _id: "space_1", organizationId: "org_1", visibility: "private" },
    space_other: {
      _id: "space_other",
      organizationId: "org_2",
      visibility: "public",
    },
    project_1: {
      _id: "project_1",
      organizationId: "org_1",
      visibility: "private",
    },
    project_other: {
      _id: "project_other",
      organizationId: "org_2",
      visibility: "organization",
    },
    client_1: { _id: "client_1", organizationId: "org_1" },
  };
  return {
    ...input,
    auth: { getUserIdentity: async () => null },
    runQuery: vi.fn(),
    db: {
      normalizeId: vi.fn((table: string, value: string) =>
        value.startsWith(table.slice(0, -1)) ? value : null,
      ),
      get: vi.fn(async (id: string) => records[id] ?? null),
    },
  };
}

function channel(input: {
  type?: "organization" | "space" | "project" | "dm";
  organizationId?: string;
  visibility?: "public" | "private" | "dm";
  memberIds?: string[];
  spaceId?: string;
  projectId?: string;
}) {
  return {
    _id: "channel_1",
    _creationTime: 1,
    id: "public_channel_1",
    organizationId: input.organizationId ?? "org_1",
    name: "Channel",
    type: input.type ?? "organization",
    visibility: input.visibility ?? "public",
    memberIds: input.memberIds ?? ["creator"],
    spaceId: input.spaceId,
    projectId: input.projectId,
    createdBy: "creator",
    createdAt: 1,
    updatedAt: 1,
  };
}

describe("Channel access Interface", () => {
  it("allows an Organization owner to manage private non-DM channels", async () => {
    const access = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "owner",
        organizationRole: "owner",
        organizationMembers: ["owner"],
      }) as never,
      "org_1",
    );
    const privateChannel = channel({ visibility: "private" });

    await expect(access.canRead(privateChannel as never)).resolves.toBe(true);
    await expect(access.canUpdate(privateChannel as never)).resolves.toBe(true);
    await expect(access.canDelete(privateChannel as never)).resolves.toBe(true);
  });

  it("keeps Organization members read/post-only in public Organization channels", async () => {
    const access = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "member",
        organizationRole: "member",
        organizationMembers: ["member"],
      }) as never,
      "org_1",
    );
    const publicChannel = channel({});

    await expect(access.canRead(publicChannel as never)).resolves.toBe(true);
    await expect(access.canPost(publicChannel as never)).resolves.toBe(true);
    await expect(access.canUpdate(publicChannel as never)).resolves.toBe(false);
    await expect(access.canDelete(publicChannel as never)).resolves.toBe(false);
  });

  it.each([
    ["admin", true],
    ["member", true],
    ["viewer", false],
  ] as const)(
    "maps Project %s access to channel posting",
    async (projectRole, canPost) => {
      const access = await resolveChannelAccess(
        fakeCtx({
          actorUserId: "participant",
          organizationRole: "member",
          organizationMembers: ["participant"],
          projectRole,
        }) as never,
        "org_1",
      );
      const projectChannel = channel({
        type: "project",
        projectId: "project_1",
        memberIds: ["participant"],
      });

      await expect(access.canRead(projectChannel as never)).resolves.toBe(true);
      await expect(access.canPost(projectChannel as never)).resolves.toBe(
        canPost,
      );
    },
  );

  it("maps a Space viewer to read-only channel access", async () => {
    const access = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "viewer",
        organizationRole: "member",
        organizationMembers: ["viewer"],
        spaceRole: "viewer",
      }) as never,
      "org_1",
    );
    const spaceChannel = channel({
      type: "space",
      spaceId: "space_1",
      memberIds: ["viewer"],
    });

    await expect(access.canRead(spaceChannel as never)).resolves.toBe(true);
    await expect(access.canPost(spaceChannel as never)).resolves.toBe(false);
  });

  it("denies cross-Organization linked resources", async () => {
    const access = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "member",
        organizationRole: "member",
        organizationMembers: ["member"],
        projectRole: "admin",
      }) as never,
      "org_1",
    );
    const crossOrg = channel({
      type: "project",
      projectId: "project_other",
      memberIds: ["member"],
    });

    await expect(access.canRead(crossOrg as never)).resolves.toBe(false);
  });

  it("exposes direct messages only to participants, including against owner bypass", async () => {
    const ownerAccess = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "owner",
        organizationRole: "owner",
        organizationMembers: ["owner", "alice", "bob"],
      }) as never,
      "org_1",
    );
    const dm = channel({
      type: "dm",
      visibility: "dm",
      memberIds: ["alice", "bob"],
    });

    await expect(ownerAccess.canRead(dm as never)).resolves.toBe(false);

    const participantAccess = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "alice",
        organizationRole: "member",
        organizationMembers: ["alice", "bob"],
      }) as never,
      "org_1",
    );
    await expect(participantAccess.canRead(dm as never)).resolves.toBe(true);
  });

  it("fails closed after scoped access is revoked", async () => {
    const access = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "revoked",
        organizationRole: "member",
        organizationMembers: ["revoked"],
      }) as never,
      "org_1",
    );
    const privateSpaceChannel = channel({
      type: "space",
      spaceId: "space_1",
      memberIds: ["revoked"],
    });

    await expect(access.canRead(privateSpaceChannel as never)).resolves.toBe(
      false,
    );
  });

  it("rejects outsiders and unauthenticated actors with structured errors", async () => {
    await expect(
      resolveChannelAccess(
        fakeCtx({ actorUserId: "outsider", organizationMembers: [] }) as never,
        "org_1",
      ),
    ).rejects.toBeInstanceOf(ConvexError);
    await expect(
      resolveChannelAccess(
        fakeCtx({ organizationMembers: [] }) as never,
        "org_1",
      ),
    ).rejects.toMatchObject({ data: { code: "AUTHENTICATION_REQUIRED" } });
  });

  it("rejects cross-Organization DM participants on create", async () => {
    const access = await resolveChannelAccess(
      fakeCtx({
        actorUserId: "alice",
        organizationRole: "member",
        organizationMembers: ["alice"],
      }) as never,
      "org_1",
    );

    await expect(
      access.assertCanCreate({
        type: "dm",
        visibility: "dm",
        memberIds: ["alice", "outsider"],
      } as never),
    ).rejects.toMatchObject({ data: { code: "CHANNEL_SCOPE_INVALID" } });
  });
});
