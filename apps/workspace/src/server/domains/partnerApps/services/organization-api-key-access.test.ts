import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexCalls } from "@/server/convex/http-client";
import {
  isOrganizationApiKeyToken,
  organizationApiKeyAccessError,
  requireOrganizationApiKeyAccess,
} from "./organization-api-key-access";

vi.mock("@convex/_generated/api", () => ({
  api: {
    organizationApiKeys: {
      validateAndReserve: "organizationApiKeys.validateAndReserve",
    },
  },
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: {
    mutation: vi.fn(),
  },
}));

const convexMutationMock = vi.mocked(convexCalls.mutation);

function appForApiKeyTests() {
  const app = new Hono();
  app.get("/organizations/:organizationId/clients", async (c) => {
    try {
      const access = await requireOrganizationApiKeyAccess(c, c.req.param("organizationId"), "client", "read");
      return c.json(access);
    } catch (error) {
      return organizationApiKeyAccessError(error);
    }
  });
  return app;
}

describe("organization API key bearer access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects organization API key tokens by prefix", () => {
    expect(isOrganizationApiKeyToken("qentrah_org_secret")).toBe(true);
    expect(isOrganizationApiKeyToken("partner-token")).toBe(false);
  });

  it("validates and reserves quota for bearer API keys", async () => {
    convexMutationMock.mockResolvedValueOnce({
      ok: true,
      organizationId: "org_1",
      apiKeyId: "api_key_1",
      keyId: "component_key_1",
      name: "CRM sync",
      permissions: [{ resource: "client", actions: ["read"] }],
    });

    const response = await appForApiKeyTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer qentrah_org_secret" },
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

  it("maps quota failures to 429 responses", async () => {
    convexMutationMock.mockResolvedValueOnce({ ok: false, reason: "rate_limited" });

    const response = await appForApiKeyTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer qentrah_org_secret" },
    });

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: "rate_limited" });
  });
});
