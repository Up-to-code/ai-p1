import { describe, expect, it, vi } from "vitest";
import { getAdminDomainDetail, listAdminDomain, runAdminDomainAction } from "./admin-domain-service";

vi.mock("./admin-convex", () => ({
  adminConvexConfigured: vi.fn(() => true),
  listAdminDomainFromConvex: vi.fn(async (domain: string) => ({
    domain,
    rows: [{
      id: "app_1",
      title: "Reviewed app",
      subtitle: "Partner",
      status: "pending",
      href: "/apps/app_1",
      updatedAt: 1_000,
      fields: [{ label: "OAuth client", value: "client_1" }],
    }],
    total: 1,
    page: 1,
    pageSize: 50,
    isDone: true,
    continueCursor: "",
    facets: [],
    warnings: [],
  })),
  getAdminDomainDetailFromConvex: vi.fn(async (domain: string, id: string) => ({
    domain,
    record: {
      id,
      title: "Reviewed app",
      subtitle: "Partner",
      status: "pending",
      href: `/apps/${id}`,
      updatedAt: 1_000,
      fields: [{ label: "OAuth client", value: "client_1" }],
    },
    related: [],
    sections: [],
    notifications: [],
    auditTimeline: [{ id: "audit_1", actor: "admin", action: "inspect", summary: "loaded", createdAt: 1_000 }],
    availableActions: [],
  })),
  runAdminDomainActionInConvex: vi.fn(async (domain: string, request: { targetId: string; actionId: string }) => ({
    record: {
      id: request.targetId,
      title: "Reviewed app",
      subtitle: "Partner",
      status: request.actionId,
      href: `/apps/${request.targetId}`,
      updatedAt: 2_000,
      fields: [],
    },
    auditId: "audit_1",
    nextState: request.actionId,
  })),
}));

const platformIdentity = {
  userId: "admin_1",
  email: "admin@qentrah.local",
  name: null,
  image: null,
  roles: ["platform_admin" as const],
};

describe("admin domain lifecycle service", () => {
  it("lists every domain through the shared contract", async () => {
    const response = await listAdminDomain("security", { search: "token" });
    expect(response.domain).toBe("security");
    expect(response.rows[0]?.fields.some((field) => field.secret)).toBe(true);
  });

  it("returns detail with actions and audit timeline", async () => {
    const list = await listAdminDomain("apps");
    const detail = await getAdminDomainDetail("apps", list.rows[0]!.id, platformIdentity);
    expect(detail?.availableActions.length).toBeGreaterThan(0);
    expect(detail?.auditTimeline.length).toBeGreaterThan(0);
  });

  it("requires platform admin for mutations", async () => {
    await expect(runAdminDomainAction("apps", {
      actionId: "rejected",
      targetId: "app_1",
      reason: "risk review",
    }, { ...platformIdentity, roles: ["audit_viewer"] })).rejects.toThrow("Platform admin");
  });

  it("records soft-control actions for platform admins", async () => {
    await expect(runAdminDomainAction("apps", {
      actionId: "rejected",
      targetId: "app_1",
      reason: "risk review",
    }, platformIdentity)).resolves.toMatchObject({
      nextState: "rejected",
    });
  });
});
