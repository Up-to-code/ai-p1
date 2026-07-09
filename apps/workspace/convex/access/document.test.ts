import { ConvexError } from "convex/values";
import { describe, expect, it, vi } from "vitest";

vi.mock("../auth", () => ({
  authUser: {
    safeGetAuthUser: vi.fn(async (ctx: { actorUserId?: string }) =>
      ctx.actorUserId ? { _id: ctx.actorUserId } : null,
    ),
  },
}));

import { resolveDocumentAccess } from "./document";

type OrganizationRole = "owner" | "admin" | "member" | null;
type ProjectRole = "admin" | "member" | "viewer";
type SpaceRole = "admin" | "member" | "viewer";

function fakeCtx(input: {
  actorUserId?: string;
  organizationRole: OrganizationRole;
  projects?: Record<string, ReturnType<typeof project>>;
  spaces?: Record<string, ReturnType<typeof space>>;
  projectMemberships?: Array<{ projectId: string; role: ProjectRole }>;
  spaceMemberships?: Array<{ spaceId: string; role: SpaceRole }>;
  projectSpaceLinks?: Array<{ projectId: string; spaceId: string }>;
}) {
  const chain = { eq: () => chain };
  const rows = {
    projectMembers: (input.projectMemberships ?? []).map((membership) => ({
      ...membership,
      recordState: "active",
    })),
    spaceMembers: (input.spaceMemberships ?? []).map((membership) => ({
      ...membership,
      recordState: "active",
    })),
    projectSpaces: (input.projectSpaceLinks ?? []).map((link) => ({
      ...link,
      recordState: "active",
    })),
  };

  return {
    actorUserId: input.actorUserId,
    auth: { getUserIdentity: async () => null },
    runQuery: vi.fn(async () =>
      input.organizationRole
        ? { role: input.organizationRole, userId: input.actorUserId }
        : null,
    ),
    db: {
      get: vi.fn(
        async (id: string) =>
          input.projects?.[id] ?? input.spaces?.[id] ?? null,
      ),
      query: vi.fn((table: keyof typeof rows) => ({
        withIndex: vi.fn(
          (_name: string, build: (q: typeof chain) => unknown) => {
            build(chain);
            return { take: vi.fn(async () => rows[table]) };
          },
        ),
      })),
    },
  };
}

function project(input: {
  id: string;
  organizationId?: string;
  ownerUserId?: string;
  visibility?: "private" | "space_members" | "organization";
  deletedAt?: number;
}) {
  return {
    _id: input.id,
    _creationTime: 1,
    organizationId: input.organizationId ?? "org_1",
    name: input.id,
    ownerUserId: input.ownerUserId ?? "project_owner",
    status: "active" as const,
    health: "onTrack" as const,
    visibility: input.visibility ?? "private",
    recordState: "active" as const,
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
    deletedAt: input.deletedAt,
  };
}

function space(input: { id: string; organizationId?: string }) {
  return {
    _id: input.id,
    _creationTime: 1,
    organizationId: input.organizationId ?? "org_1",
    name: input.id,
    slug: input.id,
    visibility: "private" as const,
    recordState: "active" as const,
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
  };
}

function document(input: {
  id: string;
  createdByUserId?: string;
  organizationId?: string;
  projectId?: string;
  visibility?: "private" | "team" | "workspace";
}) {
  return {
    _id: input.id,
    _creationTime: 1,
    organizationId: input.organizationId ?? "org_1",
    title: input.id,
    projectId: input.projectId,
    visibility: input.visibility ?? "workspace",
    createdByUserId: input.createdByUserId ?? "creator",
    createdAt: 1,
    updatedAt: 1,
  };
}

function folder(input: {
  id: string;
  organizationId?: string;
  projectId?: string;
}) {
  return {
    _id: input.id,
    _creationTime: 1,
    organizationId: input.organizationId ?? "org_1",
    name: input.id,
    projectId: input.projectId,
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
  };
}

describe("Document access Interface", () => {
  it.each(["owner", "admin"] as const)(
    "%s can read and update a private document in a private project",
    async (organizationRole) => {
      const access = await resolveDocumentAccess(
        fakeCtx({
          actorUserId: organizationRole,
          organizationRole,
          projects: { project_1: project({ id: "project_1" }) },
        }) as never,
        "org_1",
      );
      const privateDocument = document({
        id: "doc_1",
        projectId: "project_1",
        visibility: "private",
      });

      expect(await access.canReadDocument(privateDocument as never)).toBe(true);
      expect(await access.canUpdateDocument(privateDocument as never)).toBe(
        true,
      );
    },
  );

  it("keeps a private document creator-only for organization members", async () => {
    const access = await resolveDocumentAccess(
      fakeCtx({ actorUserId: "member", organizationRole: "member" }) as never,
      "org_1",
    );

    expect(
      await access.canReadDocument(
        document({
          id: "own",
          createdByUserId: "member",
          visibility: "private",
        }) as never,
      ),
    ).toBe(true);
    expect(
      await access.canReadDocument(
        document({ id: "other", visibility: "private" }) as never,
      ),
    ).toBe(false);
    expect(
      await access.canUpdateDocument(
        document({ id: "own", createdByUserId: "member" }) as never,
      ),
    ).toBe(false);
  });

  it("allows project viewers to read scoped workspace documents but never mutate", async () => {
    const access = await resolveDocumentAccess(
      fakeCtx({
        actorUserId: "viewer",
        organizationRole: "member",
        projects: { project_1: project({ id: "project_1" }) },
        projectMemberships: [{ projectId: "project_1", role: "viewer" }],
      }) as never,
      "org_1",
    );
    const scoped = document({ id: "doc_1", projectId: "project_1" });

    expect(await access.canReadDocument(scoped as never)).toBe(true);
    expect(await access.canUpdateDocument(scoped as never)).toBe(false);
    expect(
      await access.canReadFolder(
        folder({ id: "folder_1", projectId: "project_1" }) as never,
      ),
    ).toBe(true);
    expect(
      await access.canUpdateFolder(
        folder({ id: "folder_1", projectId: "project_1" }) as never,
      ),
    ).toBe(false);
  });

  it("inherits space member access only while the parent project permits it", async () => {
    const spaceProject = project({
      id: "project_1",
      visibility: "space_members",
    });
    const base = {
      actorUserId: "space_member",
      organizationRole: "member" as const,
      spaces: { space_1: space({ id: "space_1" }) },
      spaceMemberships: [{ spaceId: "space_1", role: "member" as const }],
      projectSpaceLinks: [{ projectId: "project_1", spaceId: "space_1" }],
    };
    const readable = await resolveDocumentAccess(
      fakeCtx({ ...base, projects: { project_1: spaceProject } }) as never,
      "org_1",
    );
    const privateParent = await resolveDocumentAccess(
      fakeCtx({
        ...base,
        projects: {
          project_1: project({ id: "project_1", visibility: "private" }),
        },
      }) as never,
      "org_1",
    );
    const scoped = document({ id: "doc_1", projectId: "project_1" });

    expect(await readable.canReadDocument(scoped as never)).toBe(true);
    expect(await readable.canUpdateDocument(scoped as never)).toBe(true);
    expect(await privateParent.canReadDocument(scoped as never)).toBe(false);
    expect(await privateParent.canUpdateDocument(scoped as never)).toBe(false);
  });

  it("does not allow folders or cross-organization parent IDs to widen document access", async () => {
    const access = await resolveDocumentAccess(
      fakeCtx({
        actorUserId: "member",
        organizationRole: "member",
        projects: {
          project_2: project({
            id: "project_2",
            organizationId: "org_2",
            visibility: "organization",
          }),
        },
      }) as never,
      "org_1",
    );

    expect(
      await access.canReadDocument(
        document({ id: "foreign", projectId: "project_2" }) as never,
      ),
    ).toBe(false);
    expect(
      await access.canReadFolder(
        folder({ id: "foreign_folder", organizationId: "org_2" }) as never,
      ),
    ).toBe(false);
    expect(() =>
      access.assertMatchingScope(
        { projectId: "project_1" },
        { projectId: "project_2" },
      ),
    ).toThrow(ConvexError);
  });

  it("rejects outsiders before evaluating document or folder IDs", async () => {
    await expect(
      resolveDocumentAccess(
        fakeCtx({ actorUserId: "outsider", organizationRole: null }) as never,
        "org_1",
      ),
    ).rejects.toMatchObject({
      data: { code: "ORGANIZATION_ACCESS_DENIED", organizationId: "org_1" },
    });
  });
});
