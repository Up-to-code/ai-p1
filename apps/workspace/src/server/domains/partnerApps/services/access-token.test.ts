import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import { authorizePartnerResourceRequest, partnerAccessError } from "./access-token";

vi.mock("@/packages/config", () => ({
  partnerAppsRuntimeConfig: {
    issuer: "https://qentrah.test",
    oauthAudience: "https://api.qentrah.test",
  },
}));

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

describe("partner bearer access during dev auth purge", () => {
  it("rejects bearer tokens passed through query parameters", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients?access_token=secret");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Bearer tokens must use the Authorization header.",
    });
  });

  it("requires an Authorization bearer header", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients");

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("https://api.qentrah.test");
  });

  it("rejects OAuth bearer access while customer auth is purged", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Partner OAuth bearer access is disabled during the dev-only auth purge.",
    });
  });
});
