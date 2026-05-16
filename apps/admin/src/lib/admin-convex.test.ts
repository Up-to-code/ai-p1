import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.fn();
const mutation = vi.fn();

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn(function ConvexHttpClient() {
    return { query, mutation };
  }),
}));

vi.mock("convex/server", () => ({
  makeFunctionReference: vi.fn((name: string) => ({ name })),
}));

describe("admin Convex real-data adapter", () => {
  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    process.env.CONVEX_URL = "https://convex.test";
    process.env.ADMIN_CONVEX_SERVICE_TOKEN = "server-token";
  });

  it("sends bounded cursor pagination and server-only token to Convex", async () => {
    const { listAdminDomainFromConvex } = await import("./admin-convex");
    query.mockResolvedValueOnce({
      rows: [],
      isDone: false,
      continueCursor: "next-cursor",
      warnings: [],
    });

    const response = await listAdminDomainFromConvex("apps", {
      limit: 500,
      cursor: "cursor-1",
      search: "partner",
      filters: { status: "pending" },
    });

    expect(response.pageSize).toBe(100);
    expect(response.continueCursor).toBe("next-cursor");
    expect(query).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      adminServiceToken: "server-token",
      domain: "apps",
      paginationOpts: { numItems: 100, cursor: "cursor-1" },
      search: "partner",
      filters: { status: "pending" },
    }));
  });

  it("requires Convex URL and service token before privileged reads", async () => {
    const { listAdminDomainFromConvex } = await import("./admin-convex");
    delete process.env.CONVEX_URL;
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    await expect(listAdminDomainFromConvex("apps")).rejects.toThrow("CONVEX_URL");

    process.env.CONVEX_URL = "https://convex.test";
    delete process.env.ADMIN_CONVEX_SERVICE_TOKEN;
    delete process.env.WORKSPACE_ADMIN_SERVICE_TOKEN;
    await expect(listAdminDomainFromConvex("apps")).rejects.toThrow("ADMIN_CONVEX_SERVICE_TOKEN");
  });

  it("passes partner-visible replies through action mutations", async () => {
    const { runAdminDomainActionInConvex } = await import("./admin-convex");
    mutation.mockResolvedValueOnce({
      record: { id: "app_1", title: "App", subtitle: "Partner", status: "rejected", href: "/apps/app_1", updatedAt: 1, fields: [] },
      auditId: "audit_1",
      nextState: "rejected",
    });

    await runAdminDomainActionInConvex("apps", {
      actionId: "rejected",
      targetId: "app_1",
      reason: "Redirect URI is not allowed.",
    }, {
      userId: "admin_1",
      email: "admin@qentrah.local",
      name: null,
      image: null,
      roles: ["platform_admin"],
    });

    expect(mutation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      actionId: "rejected",
      partnerReply: "Redirect URI is not allowed.",
      actorEmail: "admin@qentrah.local",
    }));
  });
});
