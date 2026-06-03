import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { convexCalls } from "@/server/convex/http-client";
import {
  partnerResourceAccessError,
  requirePartnerResourceAccess,
  writeAuthorizedPartnerResource,
} from "./partner-resource-access";
import { writeOrganizationApiKeyResource, writePartnerResource } from "./resources";

vi.mock("@convex/_generated/api", () => ({
  api: {
    organizationApiKeys: {
      validateAndReserve: "organizationApiKeys.validateAndReserve",
    },
    partnerApps: {
      apps: {
        validateWorkOSApiKey: "partnerApps.apps.validateWorkOSApiKey",
      },
    },
  },
}));

vi.mock("@/packages/config", () => ({
  partnerAppsRuntimeConfig: {
    issuer: "https://qentrah.test",
    oauthAudience: "https://api.qentrah.test",
  },
  workosRuntimeConfig: {
    apiKey: "sk_test",
  },
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: {
    mutation: vi.fn(),
    query: vi.fn(),
  },
}));

vi.mock("./resources", () => ({
  readOrganizationApiKeyResource: vi.fn(),
  readPartnerResource: vi.fn(),
  writeOrganizationApiKeyResource: vi.fn(),
  writePartnerResource: vi.fn(),
}));

const convexMutationMock = vi.mocked(convexCalls.mutation);
const writePartnerResourceMock = vi.mocked(writePartnerResource);
const writeOrganizationApiKeyResourceMock = vi.mocked(writeOrganizationApiKeyResource);

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

describe("partner resource access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects legacy OAuth bearer tokens", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { authorization: "Bearer oauth-token" },
    });

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      error: "Partner OAuth bearer tokens have been removed. Use a WorkOS partner API key.",
    });
  });

  it("preserves OAuth query-token rejection", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients?access_token=secret");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Bearer tokens must use the Authorization header.",
    });
  });

  it("preserves missing bearer challenge", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients");

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Bearer resource_metadata=");
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
  });

  it("routes WorkOS partner API key writes as partner app access, not legacy OAuth", async () => {
    writePartnerResourceMock.mockResolvedValueOnce({ ok: true });

    await expect(writeAuthorizedPartnerResource({
      type: "workosPartnerApiKey",
      token: "sk_live_secret",
      organizationId: "org_1",
      partnerId: "partner_1",
      partnerClientId: "partners_client_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      connectionId: "connection_1" as Id<"organizationPartnerConnections">,
      apiKeyId: "workos_key_1" as Id<"workosPartnerApiKeys">,
      workosApiKeyId: "api_key_1",
      workosOwnerOrganizationId: "org_workos_1",
      name: "CRM",
      scopes: ["client:update"],
    }, "client", "update", { clientId: "client_1" })).resolves.toEqual({ ok: true });

    expect(writeOrganizationApiKeyResourceMock).not.toHaveBeenCalled();
    expect(writePartnerResourceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "partnerApp",
        partnerAppId: "partners_app_1",
        connectionId: "connection_1",
      }),
      "client",
      "update",
      { clientId: "client_1" },
    );
  });
});
