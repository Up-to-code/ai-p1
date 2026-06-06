import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexCalls } from "@/server/convex/http-client";
import {
  partnerResourceAccessError,
  requirePartnerResourceAccess,
} from "./partner-resource-access";

vi.mock("@convex/_generated/api", () => ({
  api: {
    organizationApiKeys: {
      validateAndReserve: "organizationApiKeys.validateAndReserve",
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
  },
}));

const convexMutationMock = vi.mocked(convexCalls.mutation);

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

  it("rejects legacy partner OAuth bearer access", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { authorization: "Bearer oauth-token" },
    });

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      error: "Legacy partner OAuth bearer tokens are no longer supported.",
    });
  });

  it("preserves OAuth query-token rejection", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients?access_token=secret");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Bearer tokens must use the Authorization header.",
    });
  });

  it("rejects missing bearer credentials as unsupported partner bearer access", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients");

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      error: "Legacy partner OAuth bearer tokens are no longer supported.",
    });
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
