import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminServiceTokenFromEnv,
  assertAdminServiceToken,
  partnersReviewCallbackTokenFromEnv,
  reviewAdminPartnerApp,
  syncOAuthClientForPartnerApp,
  upsertPartnerAppRegistration,
} from "./admin-partner-apps";
import { convexHttp } from "@/server/convex/http-client";

vi.mock("@/server/convex/http-client", () => ({
  convexHttp: {
    action: vi.fn(),
    mutation: vi.fn(),
    query: vi.fn(),
  },
}));

const convexActionMock = vi.mocked(convexHttp.action);
const convexMutationMock = vi.mocked(convexHttp.mutation);

describe("Hub partner app service tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HUB_ADMIN_SERVICE_TOKEN = "hub-secret";
    process.env.PARTNERS_REVIEW_CALLBACK_TOKEN = "callback-secret";
  });

  it("uses only the Hub admin token for inbound admin API access", () => {
    expect(adminServiceTokenFromEnv({
      HUB_ADMIN_SERVICE_TOKEN: " hub-secret ",
      PARTNERS_REVIEW_CALLBACK_TOKEN: "callback-secret",
    })).toBe("hub-secret");
  });

  it("does not accept the legacy platform token as an admin fallback", () => {
    const headers = new Headers({ authorization: "Bearer platform-secret" });

    expect(() => assertAdminServiceToken(headers, {
      HUB_ADMIN_SERVICE_TOKEN: undefined,
      PARTNERS_REVIEW_CALLBACK_TOKEN: "callback-secret",
    })).toThrow("Invalid Hub admin service token.");
  });

  it("accepts bearer and explicit header admin tokens", () => {
    expect(() => assertAdminServiceToken(
      new Headers({ authorization: "Bearer hub-secret" }),
      { HUB_ADMIN_SERVICE_TOKEN: "hub-secret", PARTNERS_REVIEW_CALLBACK_TOKEN: undefined },
    )).not.toThrow();

    expect(() => assertAdminServiceToken(
      new Headers({ "x-hub-admin-service-token": "hub-secret" }),
      { HUB_ADMIN_SERVICE_TOKEN: "hub-secret", PARTNERS_REVIEW_CALLBACK_TOKEN: undefined },
    )).not.toThrow();
  });

  it("uses a separate callback token when Hub notifies Partners", () => {
    expect(partnersReviewCallbackTokenFromEnv({
      HUB_ADMIN_SERVICE_TOKEN: "hub-secret",
      PARTNERS_REVIEW_CALLBACK_TOKEN: " callback-secret ",
    })).toBe("callback-secret");
  });

  it("falls back to the Hub admin token for local callback development only", () => {
    expect(partnersReviewCallbackTokenFromEnv({
      HUB_ADMIN_SERVICE_TOKEN: "hub-secret",
      PARTNERS_REVIEW_CALLBACK_TOKEN: undefined,
    })).toBe("hub-secret");
  });

  it("upserts the Better Auth OAuth client after Partners registration sync", async () => {
    convexMutationMock.mockResolvedValueOnce({
      id: "hub_app_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_demo",
      oauthClientId: "partners_client_demo",
      name: "Anan OAuth Demo",
      description: "Demo",
      redirectUris: ["http://localhost:3004/api/auth/anan/callback"],
      allowedScopes: ["organization:read", "client:read"],
      clientType: "public",
      status: "pending",
      createdAt: 1,
      updatedAt: 1,
    });
    convexActionMock.mockResolvedValueOnce({ clientId: "partners_client_demo", created: true });

    await upsertPartnerAppRegistration({
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_demo",
      name: "Anan OAuth Demo",
      publisherName: "Anan",
      description: "Demo",
      homepageUrl: "http://localhost:3004",
      redirectUris: ["http://localhost:3004/api/auth/anan/callback"],
      allowedScopes: ["organization:read", "client:read"],
      clientType: "public",
    });

    expect(convexActionMock).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({
        hubPartnerAppId: "hub_app_1",
        clientId: "partners_client_demo",
        status: "pending",
        redirectUris: ["http://localhost:3004/api/auth/anan/callback"],
      }),
    });
  });

  it("syncs approved OAuth client metadata before notifying Partners", async () => {
    convexMutationMock.mockResolvedValueOnce({
      id: "hub_app_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_demo",
      oauthClientId: "partners_client_demo",
      callbackUrl: "http://localhost:3002/api/anan-review-callback",
      name: "Anan OAuth Demo",
      description: "Demo",
      redirectUris: ["http://localhost:3004/api/auth/anan/callback"],
      allowedScopes: ["organization:read", "client:read"],
      clientType: "public",
      status: "approved",
      createdAt: 1,
      updatedAt: 2,
    });
    convexActionMock.mockResolvedValueOnce({ clientId: "partners_client_demo", created: false });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 204 }));

    await reviewAdminPartnerApp("hub_app_1", { status: "approved", reviewNotes: "Approved" });

    expect(convexActionMock).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({
        clientId: "partners_client_demo",
        status: "approved",
      }),
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3002/api/anan-review-callback",
      expect.objectContaining({ method: "POST" }),
    );
    fetchMock.mockRestore();
  });

  it("maps partner app records to OAuth client sync input", async () => {
    convexActionMock.mockResolvedValueOnce({ clientId: "client_1", created: false });

    await syncOAuthClientForPartnerApp({
      id: "hub_app_1",
      oauthClientId: "client_1",
      name: "PDF Creator",
      description: "Demo",
      redirectUris: ["http://localhost:3004/api/auth/anan/callback"],
      allowedScopes: ["client:update"],
      clientType: "public",
      status: "approved",
      createdAt: 1,
      updatedAt: 2,
    });

    expect(convexActionMock).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({
        clientId: "client_1",
        clientType: "public",
        allowedScopes: ["client:update"],
      }),
    });
  });
});
