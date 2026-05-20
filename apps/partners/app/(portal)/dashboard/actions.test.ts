import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-server", () => ({
  getToken: vi.fn(),
}));

vi.mock("@/server/partnerAccount", () => ({
  partnerAccountRepository: {
    updateProfile: vi.fn(),
    updateOrganization: vi.fn(),
  },
}));

vi.mock("@/server/partnerApps", () => ({
  partnerAppsRepository: {
    create: vi.fn(),
    submitForReview: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/server/sandbox", () => ({
  sandboxRepository: {
    ensure: vi.fn(),
  },
}));

function appFormData() {
  const formData = new FormData();
  formData.set("name", "Partner CRM");
  formData.set("publisherName", "Acme");
  formData.set("homepageUrl", "https://partner.example.com");
  formData.set("clientType", "public");
  formData.set("redirectUris", "https://partner.example.com/api/auth/qentrah/callback");
  formData.set("allowedScopes", "organization:read\nclient:read");
  return formData;
}

describe("partner app dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the created app id so the UI can continue to app details and review submission", async () => {
    const { getToken } = await import("@/lib/auth-server");
    const { partnerAppsRepository } = await import("@/server/partnerApps");
    const { createPartnerAppAction } = await import("./actions");
    vi.mocked(getToken).mockResolvedValue("partner_user_1");
    vi.mocked(partnerAppsRepository.create).mockResolvedValue({
      appId: "partners_app_1",
      clientId: "partners_client_1",
      clientSecret: undefined,
    });

    await expect(createPartnerAppAction({ ok: false }, appFormData())).resolves.toMatchObject({
      ok: true,
      appId: "partners_app_1",
      clientId: "partners_client_1",
      message: "App created.",
    });
  });
});
