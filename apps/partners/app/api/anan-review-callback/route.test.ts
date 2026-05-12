import { fetchMutation } from "convex/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("convex/nextjs", () => ({
  fetchMutation: vi.fn(),
}));

const fetchMutationMock = vi.mocked(fetchMutation);

function makeRequest(body: Record<string, unknown>, token = "callback-token") {
  return new Request("http://localhost:3002/api/anan-review-callback", {
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
  hubPartnerAppId: "hub_app_1",
  hubOauthClientId: "oauth_client_1",
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
    expect(fetchMutationMock).not.toHaveBeenCalled();
  });

  it("returns unauthorized for callback token failures", async () => {
    fetchMutationMock.mockRejectedValueOnce(new Error("Invalid Partners review callback token."));

    const response = await POST(makeRequest(validPayload) as never);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid Partners review callback token." });
  });

  it("returns a clear service unavailable error when Convex functions are not deployed", async () => {
    fetchMutationMock.mockRejectedValueOnce(new Error("Could not find public function for 'partnerApps:applyHubReviewDecision'. Did you forget to run `npx convex dev`?"));

    const response = await POST(makeRequest(validPayload) as never);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toContain("Partners backend is not deployed");
    expect(body.detail).toContain("partnerApps:applyHubReviewDecision");
  });
});
