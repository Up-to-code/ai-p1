import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyAccessToken } from "better-auth/oauth2";
import { convexCalls } from "@/server/convex/http-client";
import {
  partnerResourceAccessError,
  requirePartnerResourceAccess,
} from "./partner-resource-access";

vi.mock("better-auth/oauth2", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("@convex/_generated/api", () => ({
  api: {
    organizationApiKeys: {
      validateAndReserve: "organizationApiKeys.validateAndReserve",
    },
    partnerApps: {
      apps: {
        validateAccess: "partnerApps.apps.validateAccess",
      },
    },
  },
}));

vi.mock("@/packages/config", () => ({
  partnerAppsRuntimeConfig: {
    issuer: "https://qentrah.test",
    oauthAudience: "https://api.qentrah.test",
  },
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: {
    mutation: vi.fn(),
    query: vi.fn(),
  },
}));

const verifyAccessTokenMock = vi.mocked(verifyAccessToken);
const convexMutationMock = vi.mocked(convexCalls.mutation);
const convexQueryMock = vi.mocked(convexCalls.query);

function appForAccessTests() {
  const app = new Hono();
  app.get("/organizations/:organizationId/clients", async (c) => {
    try {
      const access = await requirePartnerResourceAccess(c, "client", "read");
      return c.json(access);
    } catch (error) {
      return partnerResourceAccessError(error);
    }
  });
  return app;
}

describe("partner resource access seam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authorizes OAuth bearer access through Better Auth claims and organization grants", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce({
      organization_id: "org_1",
      azp: "partners_client_1",
      partner_scopes: ["client:read"],
      scope: "openid client:read",
    });
    convexQueryMock.mockResolvedValueOnce({
      ok: true,
      partnerAppId: "partners_app_1",
      connectionId: "connection_1",
      scopes: ["client:read"],
      appName: "Partner CRM",
    });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { authorization: "Bearer oauth-token" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      type: "oauth",
      organizationId: "org_1",
      partnerAppId: "partners_app_1",
      connectionId: "connection_1",
      scopes: ["client:read"],
    });
    expect(convexQueryMock).toHaveBeenCalledWith("partnerApps.apps.validateAccess", {
      organizationId: "org_1",
      partnersClientId: "partners_client_1",
      scopes: ["client:read"],
      resource: "client",
      action: "read",
    });
  });

  it("preserves OAuth query-token rejection", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients?access_token=secret");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Bearer tokens must use the Authorization header.",
    });
    expect(verifyAccessTokenMock).not.toHaveBeenCalled();
  });

  it("preserves missing OAuth bearer challenge", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients");

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("https://api.qentrah.test");
  });

  it("authorizes organization API key bearer access through quota reservation", async () => {
    convexMutationMock.mockResolvedValueOnce({
      ok: true,
      organizationId: "org_1",
      apiKeyId: "api_key_1",
      keyId: "component_key_1",
      name: "CRM sync",
      permissions: [{ resource: "client", actions: ["read"] }],
    });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { authorization: "Bearer qentrah_org_secret" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      type: "apiKey",
      organizationId: "org_1",
      apiKeyId: "api_key_1",
      keyId: "component_key_1",
      scopes: ["client:read"],
    });
    expect(convexMutationMock).toHaveBeenCalledWith("organizationApiKeys.validateAndReserve", {
      organizationId: "org_1",
      secret: "qentrah_org_secret",
      resource: "client",
      action: "read",
    });
    expect(verifyAccessTokenMock).not.toHaveBeenCalled();
  });

  it("preserves organization API key rate limit status", async () => {
    convexMutationMock.mockResolvedValueOnce({ ok: false, reason: "rate_limited" });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { authorization: "Bearer qentrah_org_secret" },
    });

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: "rate_limited" });
  });
});
