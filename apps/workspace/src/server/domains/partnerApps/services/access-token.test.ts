import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyAccessToken } from "better-auth/oauth2";
import { convexCalls } from "@/server/convex/http-client";
import { authorizePartnerResourceRequest, partnerAccessError, partnerIssuerCandidates, partnerJwksUrl } from "./access-token";

vi.mock("better-auth/oauth2", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("@convex/_generated/api", () => ({
  api: {
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
    query: vi.fn(),
  },
}));

const verifyAccessTokenMock = vi.mocked(verifyAccessToken);
const convexQueryMock = vi.mocked(convexCalls.query);

function appForAccessTests() {
  const app = new Hono();
  app.get("/organizations/:organizationId/clients", async (c) => {
    try {
      const access = await authorizePartnerResourceRequest(c, c.req.param("organizationId"), "client", "read");
      return c.json(access);
    } catch (error) {
      return partnerAccessError(error);
    }
  });
  return app;
}

describe("partner bearer access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the Better Auth Convex JWKS route", () => {
    expect(partnerJwksUrl("https://qentrah.test/")).toBe("https://qentrah.test/api/auth/convex/jwks");
  });

  it("accepts both site and Better Auth route issuers", () => {
    expect(partnerIssuerCandidates("https://qentrah.test/")).toEqual([
      "https://qentrah.test",
      "https://qentrah.test/api/auth",
    ]);
  });

  it("rejects bearer tokens passed through query parameters", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients?access_token=secret");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Bearer tokens must use the Authorization header.",
    });
    expect(verifyAccessTokenMock).not.toHaveBeenCalled();
  });

  it("requires an Authorization bearer header", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients");

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("https://api.qentrah.test");
    expect(verifyAccessTokenMock).not.toHaveBeenCalled();
  });

  it("rejects tokens minted for another organization", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce({
      organization_id: "org_2",
      azp: "oauth_client_1",
      scope: "client:read",
    });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Token organization does not match this route.",
    });
    expect(convexQueryMock).not.toHaveBeenCalled();
  });

  it("rejects legacy organization claim aliases", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce({
      organizationId: "org_1",
      azp: "oauth_client_1",
      scope: "client:read",
    });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Legacy organization claim aliases are not supported.",
    });
    expect(convexQueryMock).not.toHaveBeenCalled();
  });

  it("rejects tokens without an OAuth client id", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce({
      organization_id: "org_1",
      scope: "client:read",
    });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Token client is missing.",
    });
    expect(convexQueryMock).not.toHaveBeenCalled();
  });

  it("validates the token against the Convex partner connection authority", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce({
      organization_id: "org_1",
      azp: "oauth_client_1",
      scope: "openid profile client:read",
      partner_scopes: ["client:read"],
    });
    convexQueryMock.mockResolvedValueOnce({
      ok: true,
      partnerAppId: "partner_app_1",
      connectionId: "connection_1",
      scopes: ["client:read"],
      appName: "Partner CRM",
    });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      token: "partner-token",
      organizationId: "org_1",
      partnersClientId: "oauth_client_1",
      partnerAppId: "partner_app_1",
      connectionId: "connection_1",
      scopes: ["client:read"],
    });
    expect(verifyAccessTokenMock).toHaveBeenCalledWith("partner-token", expect.objectContaining({
      jwksUrl: "https://qentrah.test/api/auth/convex/jwks",
      verifyOptions: expect.objectContaining({
        issuer: ["https://qentrah.test", "https://qentrah.test/api/auth"],
      }),
      scopes: ["client:read"],
    }));
    expect(convexQueryMock).toHaveBeenCalledWith("partnerApps.apps.validateAccess", {
      organizationId: "org_1",
      partnersClientId: "oauth_client_1",
      scopes: ["client:read"],
      resource: "client",
      action: "read",
    });
  });

  it("returns forbidden when Convex rejects the requested scope", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce({
      organization_id: "org_1",
      client_id: "oauth_client_1",
      scope: "client:read",
    });
    convexQueryMock.mockResolvedValueOnce({ ok: false, reason: "scope_denied" });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "scope_denied" });
  });

  it("returns unauthorized when the organization connection is expired", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce({
      organization_id: "org_1",
      client_id: "oauth_client_1",
      scope: "client:read",
    });
    convexQueryMock.mockResolvedValueOnce({ ok: false, reason: "connection_expired" });

    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "connection_expired" });
  });
});
