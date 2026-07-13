import { beforeEach, describe, expect, it, vi } from "vitest";

const assertCanUpdateProject = vi.fn();
const assertCanUpdateSpace = vi.fn();
const assertCanReadProject = vi.fn();
const assertCanReadSpace = vi.fn();
const canReadProject = vi.fn<(record: { _id: string }) => boolean>(() => true);
const canReadSpace = vi.fn<(record: { _id: string }) => boolean>(() => true);

vi.mock("./project", () => ({
  resolveProjectAccess: vi.fn(async () => ({
    actor: { userId: "actor_1" },
    canRead: canReadProject,
    assertCanRead: assertCanReadProject,
    assertCanUpdate: assertCanUpdateProject,
  })),
}));

vi.mock("./space", () => ({
  resolveSpaceAccess: vi.fn(async () => ({
    actor: { userId: "actor_1" },
    canRead: canReadSpace,
    assertCanRead: assertCanReadSpace,
    assertCanUpdate: assertCanUpdateSpace,
  })),
}));

import { resolveProjectSpaceAccess } from "./projectSpace";

function activeRecord(id: string, organizationId = "org_1") {
  return {
    _id: id,
    _creationTime: 1,
    organizationId,
    recordState: "active",
  };
}

function fakeCtx(records: Record<string, ReturnType<typeof activeRecord> | null>) {
  return {
    auth: { getUserIdentity: vi.fn() },
    runQuery: vi.fn(),
    db: {
      get: vi.fn(async (id: string) => records[id] ?? null),
    },
  };
}

describe("Project–Space relation access Interface", () => {
  beforeEach(() => {
    assertCanUpdateProject.mockReset();
    assertCanUpdateSpace.mockReset();
    assertCanReadProject.mockReset();
    assertCanReadSpace.mockReset();
    canReadProject.mockReset().mockReturnValue(true);
    canReadSpace.mockReset().mockReturnValue(true);
  });

  it("requires update access to the Project and every affected Space", async () => {
    const access = await resolveProjectSpaceAccess(
      fakeCtx({
        project_1: activeRecord("project_1"),
        space_1: activeRecord("space_1"),
        space_2: activeRecord("space_2"),
      }) as never,
      "org_1",
    );

    await expect(
      access.assertCanManageLink("project_1" as never, [
        "space_1" as never,
        "space_2" as never,
      ]),
    ).resolves.toMatchObject({
      project: { _id: "project_1" },
      spaces: [{ _id: "space_1" }, { _id: "space_2" }],
    });
    expect(access.actorUserId).toBe("actor_1");
    expect(assertCanUpdateProject).toHaveBeenCalledTimes(1);
    expect(assertCanUpdateSpace).toHaveBeenCalledTimes(2);
  });

  it("fails closed when the Project belongs to another Organization", async () => {
    const access = await resolveProjectSpaceAccess(
      fakeCtx({
        project_1: activeRecord("project_1", "org_other"),
        space_1: activeRecord("space_1"),
      }) as never,
      "org_1",
    );

    await expect(
      access.assertCanManageLink("project_1" as never, ["space_1" as never]),
    ).rejects.toMatchObject({
      data: { code: "PROJECT_NOT_FOUND", organizationId: "org_1" },
    });
    expect(assertCanUpdateProject).not.toHaveBeenCalled();
    expect(assertCanUpdateSpace).not.toHaveBeenCalled();
  });

  it("fails closed when any Space is missing, deleted, or cross-Organization", async () => {
    const access = await resolveProjectSpaceAccess(
      fakeCtx({
        project_1: activeRecord("project_1"),
        space_1: activeRecord("space_1", "org_other"),
      }) as never,
      "org_1",
    );

    await expect(
      access.assertCanManageLink("project_1" as never, ["space_1" as never]),
    ).rejects.toMatchObject({
      data: { code: "SPACE_NOT_FOUND", organizationId: "org_1" },
    });
    expect(assertCanUpdateProject).toHaveBeenCalledTimes(1);
    expect(assertCanUpdateSpace).not.toHaveBeenCalled();
  });

  it("deduplicates Space checks when an update keeps the same Space", async () => {
    const ctx = fakeCtx({
      project_1: activeRecord("project_1"),
      space_1: activeRecord("space_1"),
    });
    const access = await resolveProjectSpaceAccess(ctx as never, "org_1");

    await access.assertCanManageLink("project_1" as never, [
      "space_1" as never,
      "space_1" as never,
    ]);

    expect(ctx.db.get).toHaveBeenCalledTimes(2);
    expect(assertCanUpdateSpace).toHaveBeenCalledTimes(1);
  });

  it("returns only links whose Project and Space are both readable", async () => {
    canReadProject.mockImplementation((record: { _id: string }) =>
      record._id !== "project_hidden",
    );
    canReadSpace.mockImplementation((record: { _id: string }) =>
      record._id !== "space_hidden",
    );
    const access = await resolveProjectSpaceAccess(
      fakeCtx({
        project_visible: activeRecord("project_visible"),
        project_hidden: activeRecord("project_hidden"),
        space_visible: activeRecord("space_visible"),
        space_hidden: activeRecord("space_hidden"),
      }) as never,
      "org_1",
    );
    const links = [
      {
        ...activeRecord("link_visible"),
        projectId: "project_visible",
        spaceId: "space_visible",
      },
      {
        ...activeRecord("link_hidden_project"),
        projectId: "project_hidden",
        spaceId: "space_visible",
      },
      {
        ...activeRecord("link_hidden_space"),
        projectId: "project_visible",
        spaceId: "space_hidden",
      },
    ];

    await expect(access.filterReadableLinks(links as never)).resolves.toEqual([
      links[0],
    ]);
  });

  it("requires read access to both sides for a direct relation lookup", async () => {
    const access = await resolveProjectSpaceAccess(
      fakeCtx({
        project_1: activeRecord("project_1"),
        space_1: activeRecord("space_1"),
      }) as never,
      "org_1",
    );

    await access.assertCanReadLink(
      "project_1" as never,
      "space_1" as never,
    );
    expect(assertCanReadProject).toHaveBeenCalledTimes(1);
    expect(assertCanReadSpace).toHaveBeenCalledTimes(1);
  });
});
