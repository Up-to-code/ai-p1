import { beforeEach, describe, expect, it, vi } from "vitest";

const partnerAppFindMany = vi.fn();
const partnerAppFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    partnerApp: {
      findMany: partnerAppFindMany,
      findUnique: partnerAppFindUnique,
    },
  },
}));

const publishedApp = {
  id: "partners_app_123",
  clientId: "partners_client_123",
  name: "Launch Desk",
  publisherName: "Qentrah Labs",
  description: "Partner app",
  homepageUrl: "https://partner.example.com",
  iconUrl: null,
  logoUrl: null,
  clientType: "confidential",
  redirectUris: ["https://partner.example.com/oauth/callback"],
  allowedScopes: ["organization:read", "client:read"],
  status: "active",
  updatedAt: new Date("2026-05-16T12:00:00.000Z"),
};

describe("Partners platform catalog API repository", () => {
  beforeEach(() => {
    partnerAppFindMany.mockReset();
    partnerAppFindUnique.mockReset();
    vi.resetModules();
  });

  it("caches published catalog list results for repeated Workspace reads", async () => {
    partnerAppFindMany.mockResolvedValue([publishedApp]);
    const { platformPartnerAppsRepository } = await import("./platformApi");

    await expect(platformPartnerAppsRepository.listPublished({ limit: 200 })).resolves.toMatchObject({
      apps: [{ id: "partners_app_123", clientId: "partners_client_123" }],
      isDone: true,
    });
    await platformPartnerAppsRepository.listPublished({ limit: 200 });

    expect(partnerAppFindMany).toHaveBeenCalledTimes(1);
  });

  it("uses separate cache entries for different list cursors", async () => {
    partnerAppFindMany.mockResolvedValue([publishedApp]);
    const { platformPartnerAppsRepository } = await import("./platformApi");

    await platformPartnerAppsRepository.listPublished({ limit: 200 });
    await platformPartnerAppsRepository.listPublished({ limit: 200, cursor: "next_page" });

    expect(partnerAppFindMany).toHaveBeenCalledTimes(2);
  });

  it("caches published app lookups for authorization verification", async () => {
    partnerAppFindUnique.mockResolvedValue(publishedApp);
    const { platformPartnerAppsRepository } = await import("./platformApi");

    await expect(platformPartnerAppsRepository.getPublished("partners_app_123")).resolves.toMatchObject({
      id: "partners_app_123",
      clientId: "partners_client_123",
    });
    await platformPartnerAppsRepository.getPublished("partners_app_123");

    expect(partnerAppFindUnique).toHaveBeenCalledTimes(1);
  });
});
