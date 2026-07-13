import { ConvexError } from "convex/values";
import { describe, expect, it, vi } from "vitest";

vi.mock("../auth", () => ({
  safeGetAuthUser: vi.fn(async (ctx: { actorUserId?: string }) =>
      ctx.actorUserId ? { _id: ctx.actorUserId } : null,
    ),
}));

import { resolveSpaceAccess } from "./space";

type Role = "owner" | "admin" | "member" | "project_lead" | null;

function fakeCtx(input: {
  actorUserId?: string;
  role: Role;
  memberSpaceIds?: string[];
}) {
  const memberships = (input.memberSpaceIds ?? []).map((spaceId) => ({
    spaceId,
    role: "member" as const,
    recordState: "active",
  }));
  const chain = {
    eq: () => chain,
  };

  return {
    actorUserId: input.actorUserId,
    auth: { getUserIdentity: async () => null },
    runQuery: vi.fn(async () =>
      input.role ? { role: input.role, userId: input.actorUserId } : null,
    ),
    db: {
      query: vi.fn(() => ({
        withIndex: vi.fn((_name: string, build: (q: typeof chain) => unknown) => {
          build(chain);
          return {
            collect: vi.fn(async () => memberships),
            take: vi.fn(async () => memberships),
          };
        }),
      })),
    },
  };
}

function space(input: {
  id: string;
  organizationId?: string;
  visibility: "private" | "public" | "request_only";
}) {
  return {
    _id: input.id,
    _creationTime: 1,
    organizationId: input.organizationId ?? "org_1",
    name: input.id,
    slug: input.id,
    visibility: input.visibility,
    recordState: "active",
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
  };
}

describe("Space access Interface", () => {
  it("gives owners read access to every active Space in their Organization", async () => {
    const access = await resolveSpaceAccess(
      fakeCtx({ actorUserId: "owner_1", role: "owner" }) as never,
      "org_1",
    );

    expect(access.canRead(space({ id: "private", visibility: "private" }) as never)).toBe(true);
    expect(access.canRead(space({ id: "request", visibility: "request_only" }) as never)).toBe(true);
  });

  it.each(["admin", "member"] as const)(
    "preserves discovery and read semantics for Organization %s roles",
    async (role) => {
      const access = await resolveSpaceAccess(
        fakeCtx({ actorUserId: `${role}_1`, role }) as never,
        "org_1",
      );
      const publicSpace = space({ id: "public", visibility: "public" });
      const requestOnlySpace = space({ id: "request", visibility: "request_only" });
      const privateSpace = space({ id: "private", visibility: "private" });

      expect(access.canDiscover(publicSpace as never)).toBe(true);
      expect(access.canRead(publicSpace as never)).toBe(true);
      expect(access.canDiscover(requestOnlySpace as never)).toBe(true);
      expect(access.canRead(requestOnlySpace as never)).toBe(false);
      expect(access.canDiscover(privateSpace as never)).toBe(false);
      expect(access.canRead(privateSpace as never)).toBe(false);
    },
  );

  it("lets an explicit Space member read private and request-only Spaces", async () => {
    const access = await resolveSpaceAccess(
      fakeCtx({
        actorUserId: "member_1",
        role: "member",
        memberSpaceIds: ["private", "request"],
      }) as never,
      "org_1",
    );

    expect(access.canRead(space({ id: "private", visibility: "private" }) as never)).toBe(true);
    expect(access.canRead(space({ id: "request", visibility: "request_only" }) as never)).toBe(true);
  });

  it("denies cross-Organization Spaces even when they are public", async () => {
    const access = await resolveSpaceAccess(
      fakeCtx({ actorUserId: "member_1", role: "member" }) as never,
      "org_1",
    );

    const otherOrganizationSpace = space({
      id: "public",
      organizationId: "org_2",
      visibility: "public",
    });
    expect(access.canDiscover(otherOrganizationSpace as never)).toBe(false);
    expect(access.canRead(otherOrganizationSpace as never)).toBe(false);
  });

  it("preserves Organization membership for custom roles", async () => {
    const access = await resolveSpaceAccess(
      fakeCtx({ actorUserId: "lead_1", role: "project_lead" }) as never,
      "org_1",
    );

    expect(access.organizationRole).toBeNull();
    expect(access.canRead(space({ id: "public", visibility: "public" }) as never)).toBe(true);
  });

  it("allows only Organization owners and admins to create Spaces", async () => {
    for (const role of ["owner", "admin"] as const) {
      const access = await resolveSpaceAccess(
        fakeCtx({ actorUserId: `${role}_1`, role }) as never,
        "org_1",
      );
      await expect(access.assertCanCreate()).resolves.toBeUndefined();
    }

    const memberAccess = await resolveSpaceAccess(
      fakeCtx({ actorUserId: "member_1", role: "member" }) as never,
      "org_1",
    );
    await expect(memberAccess.assertCanCreate()).rejects.toMatchObject({
      data: { code: "SPACE_CREATE_DENIED", organizationId: "org_1" },
    });
  });

  it("rejects an actor without membership in the requested Organization", async () => {
    await expect(
      resolveSpaceAccess(
        fakeCtx({ actorUserId: "outsider", role: null }) as never,
        "org_1",
      ),
    ).rejects.toBeInstanceOf(ConvexError);
    await expect(
      resolveSpaceAccess(
        fakeCtx({ actorUserId: "outsider", role: null }) as never,
        "org_1",
      ),
    ).rejects.toMatchObject({
      data: { code: "ORGANIZATION_ACCESS_DENIED", organizationId: "org_1" },
    });
  });

  it("requires a server-derived authenticated actor", async () => {
    await expect(
      resolveSpaceAccess(fakeCtx({ role: "member" }) as never, "org_1"),
    ).rejects.toMatchObject({
      data: { code: "AUTHENTICATION_REQUIRED" },
    });
  });

  it("does not silently truncate actors with more than 500 Space memberships", async () => {
    const memberSpaceIds = Array.from(
      { length: 601 },
      (_, index) => `space_${index}`,
    );
    const access = await resolveSpaceAccess(
      fakeCtx({
        actorUserId: "member_1",
        role: "member",
        memberSpaceIds,
      }) as never,
      "org_1",
    );

    expect(
      access.canRead(
        space({ id: "space_600", visibility: "private" }) as never,
      ),
    ).toBe(true);
  });
});
