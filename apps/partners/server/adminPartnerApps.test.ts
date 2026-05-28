import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type PartnerAppRow = {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  homepageUrl: string | null;
  iconUrl: string | null;
  logoUrl: string | null;
  clientType: string;
  redirectUris: string[];
  allowedScopes: string[];
  status: string;
  workspaceSyncStatus: string | null;
  workspaceSyncError: string | null;
  reviewNotes: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const partnerAppFindUnique = vi.fn();
const partnerAppUpdate = vi.fn();
const partnerAppReviewCreate = vi.fn();
const partnerEventCreate = vi.fn();
const prismaTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    partnerApp: {
      findUnique: partnerAppFindUnique,
      update: partnerAppUpdate,
    },
    partnerAppReview: {
      create: partnerAppReviewCreate,
    },
    partnerEvent: {
      create: partnerEventCreate,
    },
    $transaction: prismaTransaction,
  },
}));

function appRow(overrides: Partial<PartnerAppRow> = {}): PartnerAppRow {
  return {
    id: "partners_app_123",
    clientId: "partners_client_123",
    name: "Launch Desk",
    publisherName: "Qentrah Labs",
    homepageUrl: "https://partner.example.com",
    iconUrl: null,
    logoUrl: null,
    clientType: "confidential",
    redirectUris: ["https://partner.example.com/oauth/callback"],
    allowedScopes: ["organization:read", "client:read"],
    status: "pending_review",
    workspaceSyncStatus: "pending",
    workspaceSyncError: null,
    reviewNotes: null,
    submittedAt: new Date("2026-05-16T10:00:00.000Z"),
    reviewedAt: null,
    createdAt: new Date("2026-05-16T09:00:00.000Z"),
    updatedAt: new Date("2026-05-16T10:00:00.000Z"),
    ...overrides,
  };
}

describe("Partners admin app review runtime sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv("QENTRAH_WORKSPACE_API_URL", "https://workspace.qentrah.test");
    vi.stubEnv("QENTRAH_PLATFORM_SERVICE_TOKEN", "service-token");
    prismaTransaction.mockImplementation(async (handler) =>
      handler({
        partnerApp: { update: partnerAppUpdate },
        partnerAppReview: { create: partnerAppReviewCreate },
        partnerEvent: { create: partnerEventCreate },
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("marks runtime sync as synced only after Workspace accepts the projection", async () => {
    const current = appRow();
    const reviewed = appRow({ status: "active", workspaceSyncStatus: "pending", reviewedAt: new Date("2026-05-16T11:00:00.000Z") });
    const synced = appRow({ ...reviewed, workspaceSyncStatus: "synced" });
    partnerAppFindUnique.mockResolvedValue(current);
    partnerAppUpdate
      .mockResolvedValueOnce(reviewed)
      .mockResolvedValueOnce(synced);
    const fetchMock = vi.fn(async () => Response.json({
      runtime: {
        partnersAppId: "partners_app_123",
        clientId: "partners_client_123",
        status: "approved",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { adminPartnerAppsRepository } = await import("./adminPartnerApps");
    const result = await adminPartnerAppsRepository.review("partners_app_123", { status: "approved" }, "admin_1");

    expect(partnerAppUpdate).toHaveBeenNthCalledWith(1, expect.objectContaining({
      data: expect.objectContaining({
        status: "active",
        workspaceSyncStatus: "pending",
        workspaceSyncError: null,
      }),
    }));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://workspace.qentrah.test/api/v1/admin/oauth-client-runtime-sync",
      expect.objectContaining({ method: "POST" }),
    );
    expect(partnerAppUpdate).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: {
        workspaceSyncStatus: "synced",
        workspaceSyncError: null,
      },
    }));
    expect(result.workspaceSyncStatus).toBe("synced");
  });

  it("marks runtime sync as failed when Workspace rejects the projection response", async () => {
    const current = appRow();
    const reviewed = appRow({ status: "active", workspaceSyncStatus: "pending", reviewedAt: new Date("2026-05-16T11:00:00.000Z") });
    const failed = appRow({ ...reviewed, workspaceSyncStatus: "failed", workspaceSyncError: "Workspace OAuth runtime sync failed." });
    partnerAppFindUnique.mockResolvedValue(current);
    partnerAppUpdate
      .mockResolvedValueOnce(reviewed)
      .mockResolvedValueOnce(failed);
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "Workspace OAuth runtime sync failed." }, { status: 500 })));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const { adminPartnerAppsRepository } = await import("./adminPartnerApps");
    const result = await adminPartnerAppsRepository.review("partners_app_123", { status: "approved" }, "admin_1");

    expect(partnerAppUpdate).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: {
        workspaceSyncStatus: "failed",
        workspaceSyncError: "Workspace OAuth runtime sync failed.",
      },
    }));
    expect(result.workspaceSyncStatus).toBe("failed");
    expect(result.workspaceSyncError).toBe("Workspace OAuth runtime sync failed.");
  });
});
