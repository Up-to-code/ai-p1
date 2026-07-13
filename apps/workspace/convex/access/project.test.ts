import { ConvexError } from "convex/values";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("../auth", () => ({
  safeGetAuthUser: vi.fn(async (ctx: { actorUserId?: string }) =>
      ctx.actorUserId ? { _id: ctx.actorUserId } : null,
    ),
}));

import { projectStats } from "../workspace/readStats";
import { resolveProjectAccess } from "./project";

type OrganizationRole = "owner" | "admin" | "member" | "project_lead" | null;
type ScopedRole = "admin" | "member" | "viewer";

function fakeCtx(input: {
  actorUserId?: string;
  organizationRole: OrganizationRole;
  projectMemberships?: Array<{ projectId: string; role: ScopedRole }>;
  spaceMemberships?: Array<{ spaceId: string; role: ScopedRole }>;
  projectSpaceLinks?: Array<{ projectId: string; spaceId: string }>;
  deletedSpaceIds?: string[];
  spaceVisibilities?: Record<string, "private" | "public" | "request_only">;
}) {
  const rowsByTable = {
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
  const chain = { eq: () => chain };

  return {
    actorUserId: input.actorUserId,
    auth: { getUserIdentity: async () => null },
    runQuery: vi.fn(async () =>
      input.organizationRole
        ? { role: input.organizationRole, userId: input.actorUserId }
        : null,
    ),
    db: {
      get: vi.fn(async (id: string) => ({
        _id: id,
        organizationId: "org_1",
        visibility: input.spaceVisibilities?.[id] ?? "private",
        recordState: input.deletedSpaceIds?.includes(id) ? "deleted" : "active",
        deletedAt: input.deletedSpaceIds?.includes(id) ? 1 : undefined,
      })),
      query: vi.fn((table: keyof typeof rowsByTable) => ({
        withIndex: vi.fn(
          (_name: string, build: (q: typeof chain) => unknown) => {
            build(chain);
            return {
              collect: vi.fn(async () => rowsByTable[table]),
              take: vi.fn(async () => rowsByTable[table]),
            };
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
  visibility: "private" | "space_members" | "organization";
  status?: "planned" | "active";
}) {
  return {
    _id: input.id,
    _creationTime: 1,
    organizationId: input.organizationId ?? "org_1",
    name: input.id,
    ownerUserId: input.ownerUserId ?? "project_owner",
    status: input.status ?? "active",
    health: "onTrack",
    visibility: input.visibility,
    recordState: "active",
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
  };
}

describe("Project access Interface", () => {
  it.each([
    ["owner", true, true, true],
    ["admin", true, true, false],
  ] as const)(
    "maps Organization %s to the documented Project actions",
    async (organizationRole, canRead, canUpdate, canDelete) => {
      const access = await resolveProjectAccess(
        fakeCtx({ actorUserId: organizationRole, organizationRole }) as never,
        "org_1",
      );
      const privateProject = project({ id: "private", visibility: "private" });

      expect(access.canRead(privateProject as never)).toBe(canRead);
      expect(access.canUpdate(privateProject as never)).toBe(canUpdate);
      expect(access.canDelete(privateProject as never)).toBe(canDelete);
      await expect(access.assertCanCreate()).resolves.toBeUndefined();
    },
  );

  it("gives the Project owner administrative access", async () => {
    const access = await resolveProjectAccess(
      fakeCtx({
        actorUserId: "project_owner",
        organizationRole: "member",
      }) as never,
      "org_1",
    );
    const owned = project({ id: "owned", visibility: "private" });

    expect(access.canRead(owned as never)).toBe(true);
    expect(access.canUpdate(owned as never)).toBe(true);
    expect(access.canDelete(owned as never)).toBe(true);
  });

  it.each([
    ["admin", true, true, true],
    ["member", true, true, false],
    ["viewer", true, false, false],
  ] as const)(
    "maps direct Project %s membership to the documented actions",
    async (role, canRead, canUpdate, canDelete) => {
      const access = await resolveProjectAccess(
        fakeCtx({
          actorUserId: "actor",
          organizationRole: "member",
          projectMemberships: [{ projectId: "private", role }],
        }) as never,
        "org_1",
      );
      const privateProject = project({ id: "private", visibility: "private" });

      expect(access.canRead(privateProject as never)).toBe(canRead);
      expect(access.canUpdate(privateProject as never)).toBe(canUpdate);
      expect(access.canDelete(privateProject as never)).toBe(canDelete);
    },
  );

  it.each([
    ["admin", true, true, false],
    ["member", true, true, false],
    ["viewer", true, false, false],
  ] as const)(
    "maps linked Space %s membership to a space-members Project",
    async (role, canRead, canUpdate, canDelete) => {
      const access = await resolveProjectAccess(
        fakeCtx({
          actorUserId: "actor",
          organizationRole: "member",
          spaceMemberships: [{ spaceId: "space_1", role }],
          projectSpaceLinks: [
            { projectId: "space_project", spaceId: "space_1" },
          ],
        }) as never,
        "org_1",
      );
      const spaceProject = project({
        id: "space_project",
        visibility: "space_members",
      });

      expect(access.canRead(spaceProject as never)).toBe(canRead);
      expect(access.canUpdate(spaceProject as never)).toBe(canUpdate);
      expect(access.canDelete(spaceProject as never)).toBe(canDelete);
    },
  );

  it("does not inherit linked Space access for a private Project", async () => {
    const access = await resolveProjectAccess(
      fakeCtx({
        actorUserId: "space_admin",
        organizationRole: "member",
        spaceMemberships: [{ spaceId: "space_1", role: "admin" }],
        projectSpaceLinks: [{ projectId: "private", spaceId: "space_1" }],
      }) as never,
      "org_1",
    );

    expect(
      access.canRead(
        project({ id: "private", visibility: "private" }) as never,
      ),
    ).toBe(false);
  });

  it("does not inherit Project access from a deleted Space", async () => {
    const access = await resolveProjectAccess(
      fakeCtx({
        actorUserId: "space_admin",
        organizationRole: "member",
        spaceMemberships: [{ spaceId: "deleted_space", role: "admin" }],
        projectSpaceLinks: [
          { projectId: "space_project", spaceId: "deleted_space" },
        ],
        deletedSpaceIds: ["deleted_space"],
      }) as never,
      "org_1",
    );

    expect(
      access.canRead(
        project({ id: "space_project", visibility: "space_members" }) as never,
      ),
    ).toBe(false);
  });

  it("gives an Organization member read-only access to organization-visible Projects", async () => {
    const access = await resolveProjectAccess(
      fakeCtx({ actorUserId: "member", organizationRole: "member" }) as never,
      "org_1",
    );
    const visible = project({ id: "visible", visibility: "organization" });

    expect(access.canRead(visible as never)).toBe(true);
    expect(access.canUpdate(visible as never)).toBe(false);
    expect(access.canDelete(visible as never)).toBe(false);
  });

  it("filters requested Space IDs through the Space access policy", async () => {
    const ownerAccess = await resolveProjectAccess(
      fakeCtx({ actorUserId: "owner", organizationRole: "owner" }) as never,
      "org_1",
    );
    const adminAccess = await resolveProjectAccess(
      fakeCtx({
        actorUserId: "admin",
        organizationRole: "admin",
        spaceVisibilities: {
          private_space: "private",
          public_space: "public",
          request_space: "request_only",
        },
      }) as never,
      "org_1",
    );

    expect(
      await ownerAccess.filterActorSpaceIds(["private_space"] as never),
    ).toEqual(["private_space"]);
    expect(
      await adminAccess.filterActorSpaceIds([
        "private_space",
        "public_space",
        "request_space",
      ] as never),
    ).toEqual(["public_space"]);
  });

  it("keeps explicit private Space membership available to Organization admins", async () => {
    const access = await resolveProjectAccess(
      fakeCtx({
        actorUserId: "admin",
        organizationRole: "admin",
        spaceMemberships: [{ spaceId: "private_space", role: "viewer" }],
      }) as never,
      "org_1",
    );

    expect(
      await access.filterActorSpaceIds(["private_space"] as never),
    ).toEqual(["private_space"]);
  });

  it("excludes inaccessible Projects before aggregate totals are calculated", async () => {
    const access = await resolveProjectAccess(
      fakeCtx({ actorUserId: "member", organizationRole: "member" }) as never,
      "org_1",
    );
    const readable = project({
      id: "readable",
      visibility: "organization",
      status: "active",
    });
    const hidden = project({
      id: "hidden",
      visibility: "private",
      status: "planned",
    });

    const stats = projectStats(
      access.filterReadable([readable, hidden] as never),
    );
    expect(stats).toMatchObject({ total: 1, active: 1, planned: 0 });
  });

  it("denies outsiders and cross-Organization Projects", async () => {
    await expect(
      resolveProjectAccess(
        fakeCtx({ actorUserId: "outsider", organizationRole: null }) as never,
        "org_1",
      ),
    ).rejects.toBeInstanceOf(ConvexError);

    const access = await resolveProjectAccess(
      fakeCtx({ actorUserId: "owner", organizationRole: "owner" }) as never,
      "org_1",
    );
    const crossOrganization = project({
      id: "cross_org",
      organizationId: "org_2",
      visibility: "organization",
    });
    expect(access.canRead(crossOrganization as never)).toBe(false);
    expect(() => access.assertCanRead(crossOrganization as never)).toThrow(
      ConvexError,
    );
  });

  it("requires a server-derived authenticated actor", async () => {
    await expect(
      resolveProjectAccess(
        fakeCtx({ organizationRole: "member" }) as never,
        "org_1",
      ),
    ).rejects.toMatchObject({ data: { code: "AUTHENTICATION_REQUIRED" } });
  });

  it("does not silently truncate actors with more than 500 Project memberships", async () => {
    const projectMemberships = Array.from(
      { length: 601 },
      (_, index) => ({ projectId: `project_${index}`, role: "viewer" as const }),
    );
    const access = await resolveProjectAccess(
      fakeCtx({
        actorUserId: "actor",
        organizationRole: "member",
        projectMemberships,
      }) as never,
      "org_1",
    );

    expect(
      access.canRead(
        project({ id: "project_600", visibility: "private" }) as never,
      ),
    ).toBe(true);
  });

  it("validates requested Spaces before reading Project-Space relations", () => {
    const source = readFileSync(
      resolve(process.cwd(), "convex/projects/read.ts"),
      "utf8",
    );
    const listBySpace = source.slice(
      source.indexOf("export const listBySpace"),
      source.indexOf("export const listAccessibleBySpaceMembership"),
    );
    const listByMembership = source.slice(
      source.indexOf("export const listAccessibleBySpaceMembership"),
    );

    expect(
      listBySpace.indexOf("spaceAccess.assertCanRead(space)"),
    ).toBeLessThan(listBySpace.indexOf('.query("projectSpaces")'));
    expect(listBySpace).toContain(
      '!ps.deletedAt && ps.recordState !== "deleted"',
    );
    expect(
      listByMembership.indexOf(
        "await access.filterActorSpaceIds(args.spaceIds)",
      ),
    ).toBeLessThan(listByMembership.indexOf('.query("projectSpaces")'));
    expect(listByMembership).toContain(
      '!ps.deletedAt && ps.recordState !== "deleted"',
    );
  });
});
