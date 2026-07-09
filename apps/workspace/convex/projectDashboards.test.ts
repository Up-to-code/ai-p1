import { ConvexError } from "convex/values";
import { describe, expect, it, vi } from "vitest";
import {
  applyDashboardPatch,
  readAuthorizedDashboard,
  requireUpdatableDashboardProject,
} from "./projectDashboards";

function project(overrides: Record<string, unknown> = {}) {
  return {
    _id: "project_1",
    organizationId: "org_1",
    recordState: "active",
    ...overrides,
  } as never;
}

function ctx(input: {
  project?: ReturnType<typeof project> | null;
  dashboard?: Record<string, unknown> | null;
}) {
  const chain = { eq: () => chain };
  return {
    db: {
      get: vi.fn(async () => input.project ?? project()),
      query: vi.fn(() => ({
        withIndex: vi.fn((_name, build) => {
          build(chain);
          return { unique: vi.fn(async () => input.dashboard ?? null) };
        }),
      })),
    },
  } as never;
}

function access(input: { canRead?: boolean; canUpdate?: boolean } = {}) {
  return {
    assertCanRead: vi.fn(() => {
      if (input.canRead === false) throw new ConvexError("read denied");
    }),
    assertCanUpdate: vi.fn(() => {
      if (input.canUpdate === false) throw new ConvexError("update denied");
    }),
  };
}

describe("project dashboard persistence access", () => {
  it.each([
    ["owner", true],
    ["admin", true],
    ["member", true],
    ["viewer", false],
  ] as const)(
    "allows %s to read while applying its Project update grant",
    async (role, canUpdate) => {
      const authorized = access({ canRead: true, canUpdate });
      const result = await readAuthorizedDashboard(
        ctx({
          dashboard: {
            widgetConfig: '["tasks"]',
            layout: "[]",
            updatedAt: 1,
          },
        }),
        { organizationId: "org_1", projectId: "project_1" as never },
        authorized,
      );

      expect(result).toMatchObject({ widgetConfig: '["tasks"]' });
      expect(authorized.assertCanRead).toHaveBeenCalledOnce();
      if (canUpdate) {
        await expect(
          requireUpdatableDashboardProject(
            ctx({}),
            { organizationId: "org_1", projectId: "project_1" as never },
            authorized,
          ),
        ).resolves.toMatchObject({ _id: "project_1" });
      } else {
        await expect(
          requireUpdatableDashboardProject(
            ctx({}),
            { organizationId: "org_1", projectId: "project_1" as never },
            authorized,
          ),
        ).rejects.toBeInstanceOf(ConvexError);
      }
      expect(role).toBeTruthy();
    },
  );

  it("denies outsider reads through Project access", async () => {
    await expect(
      readAuthorizedDashboard(
        ctx({}),
        { organizationId: "org_1", projectId: "project_1" as never },
        access({ canRead: false }),
      ),
    ).rejects.toBeInstanceOf(ConvexError);

  });

  it("does not read or write a cross-organization Project", async () => {
    const foreignContext = ctx({ project: project({ organizationId: "org_2" }) });
    const authorized = access();

    await expect(
      readAuthorizedDashboard(
        foreignContext,
        { organizationId: "org_1", projectId: "project_1" as never },
        authorized,
      ),
    ).resolves.toBeNull();
    expect(authorized.assertCanRead).not.toHaveBeenCalled();

    await expect(
      requireUpdatableDashboardProject(
        foreignContext,
        { organizationId: "org_1", projectId: "project_1" as never },
        authorized,
      ),
    ).rejects.toMatchObject({ data: { code: "PROJECT_DASHBOARD_PROJECT_NOT_FOUND" } });
  });
});

describe("project dashboard persistence patches", () => {
  it("merges independent fields without overwriting newer server fields", () => {
    expect(
      applyDashboardPatch(
        {
          widgetConfig: '["tasks"]',
          layout: '[{"x": 1}]',
          notes: "Current server notes",
          updatedAt: 10,
        },
        { widgetConfig: '["notes"]' },
      ),
    ).toEqual({
      widgetConfig: '["notes"]',
      layout: '[{"x": 1}]',
      notes: "Current server notes",
    });
  });

  it("is idempotent for an identical patch and retains one dashboard key", () => {
    const existing = {
      widgetConfig: '["tasks"]',
      layout: "[]",
      notes: "Notes",
      updatedAt: 10,
    };

    expect(applyDashboardPatch(existing, { notes: "Notes" })).toEqual({
      widgetConfig: '["tasks"]',
      layout: "[]",
      notes: "Notes",
    });
  });
});
