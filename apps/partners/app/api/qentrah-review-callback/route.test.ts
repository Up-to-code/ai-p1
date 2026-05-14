import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { partnerAppsRepository } from "@/server/partnerApps";

vi.mock("@/server/partnerApps", () => ({
  partnerAppsRepository: {
    applyWorkspaceReviewDecision: vi.fn(),
  },
}));

const applyReviewMock = vi.mocked(partnerAppsRepository.applyWorkspaceReviewDecision);

function makeRequest(body: Record<string, unknown>, token = "callback-token") {
  return new Request("http://localhost:3002/api/qentrah-review-callback", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  appId: "partner_app_1",
  status: "approved",
  workspacePartnerAppId: "workspace_app_1",
  workspaceOauthClientId: "oauth_client_1",
  reviewNotes: "Approved.",
};

describe("review callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed callback payloads", async () => {
    const response = await POST(makeRequest({ appId: "partner_app_1", status: "draft" }) as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid review callback payload." });
    expect(applyReviewMock).not.toHaveBeenCalled();
  });

  it("returns unauthorized for callback token failures", async () => {
    applyReviewMock.mockRejectedValueOnce(new Error("Invalid Partners review callback token."));

    const response = await POST(makeRequest(validPayload) as never);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid Partners review callback token." });
  });

  it("applies workspace review decisions through the Prisma repository", async () => {
    applyReviewMock.mockResolvedValueOnce({ ok: true });

    const response = await POST(makeRequest(validPayload) as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(applyReviewMock).toHaveBeenCalledWith(expect.objectContaining({
      serviceToken: "callback-token",
      appId: "partner_app_1",
      status: "approved",
    }));
  });
});
