import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexCalls } from "@/server/convex/http-client";
import {
  isLikelyWorkOSPartnerApiKeyToken,
  requireWorkOSPartnerApiKeyAccess,
} from "./workos-partner-api-key-access";
import { organizationApiKeyAccessError } from "./organization-api-key-access";

const createValidationMock = vi.fn();

vi.mock("@convex/_generated/api", () => ({
  api: {
    workosPartnerApiKeys: {
      validateGrant: "workosPartnerApiKeys.validateGrant",
    },
  },
}));

vi.mock("@/server/auth/workos/client", () => ({
  getWorkOSClient: () => ({
    apiKeys: {
      createValidation: createValidationMock,
    },
  }),
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: {
    mutation: vi.fn(),
  },
}));

const convexMutationMock = vi.mocked(convexCalls.mutation);

function appForWorkOSKeyTests() {
  const app = new Hono();
  app.get("/organizations/:organizationId/clients", async (c) => {
    try {
      const access = await requireWorkOSPartnerApiKeyAccess(c, c.req.param("organizationId"), "client", "read");
      return c.json(access);
    } catch (error) {
      return organizationApiKeyAccessError(error);
    }
  });
  return app;
}

describe("WorkOS partner API key access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects likely WorkOS API key bearer tokens", () => {
    expect(isLikelyWorkOSPartnerApiKeyToken("sk_live_secret")).toBe(true);
    expect(isLikelyWorkOSPartnerApiKeyToken("sk_test_secret")).toBe(true);
    expect(isLikelyWorkOSPartnerApiKeyToken("qentrah_org_secret")).toBe(false);
  });

  it("requires WorkOS validation and an active Convex partner grant", async () => {
    createValidationMock.mockResolvedValueOnce({
      apiKey: {
        id: "api_key_1",
        owner: { type: "organization", id: "org_workos_1" },
        name: "Partner CRM",
        permissions: ["client:read"],
      },
    });
    convexMutationMock.mockResolvedValueOnce({
      ok: true,
      organizationId: "org_1",
      partnerId: "partner_1",
      partnerClientId: "client_external_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      connectionId: "connection_1",
      apiKeyId: "workos_key_1",
      permissions: ["client:read"],
      name: "Partner CRM",
    });

    const response = await appForWorkOSKeyTests().request("/organizations/org_1/clients", {
      headers: { authorization: "Bearer sk_live_secret" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      type: "workosPartnerApiKey",
      organizationId: "org_1",
      partnerId: "partner_1",
      partnersAppId: "partners_app_1",
      scopes: ["client:read"],
    });
    expect(convexMutationMock).toHaveBeenCalledWith("workosPartnerApiKeys.validateGrant", {
      organizationId: "org_1",
      workosApiKeyId: "api_key_1",
      workosOwnerOrganizationId: "org_workos_1",
      permissions: ["client:read"],
      resource: "client",
      action: "read",
    });
  });

  it("rejects valid WorkOS keys with no Convex grant", async () => {
    createValidationMock.mockResolvedValueOnce({
      apiKey: {
        id: "api_key_1",
        owner: { type: "organization", id: "org_workos_1" },
        permissions: ["client:read"],
      },
    });
    convexMutationMock.mockResolvedValueOnce({ ok: false, reason: "grant_not_found" });

    const response = await appForWorkOSKeyTests().request("/organizations/org_1/clients", {
      headers: { authorization: "Bearer sk_live_secret" },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "grant_not_found" });
  });
});
