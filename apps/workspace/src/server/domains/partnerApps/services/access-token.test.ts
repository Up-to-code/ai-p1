import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { authorizePartnerResourceRequest, partnerAccessError, partnerIssuerCandidates, partnerJwksUrl } from "./access-token";

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

describe("legacy partner OAuth bearer access", () => {
  it("keeps the legacy issuer helpers stable for diagnostics", () => {
    expect(partnerJwksUrl("https://qentrah.test/")).toBe("https://qentrah.test/api/auth/convex/jwks");
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
  });

  it("requires an Authorization bearer header", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients");

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Bearer resource_metadata=");
  });

  it("rejects legacy OAuth bearer tokens after the WorkOS migration", async () => {
    const response = await appForAccessTests().request("/organizations/org_1/clients", {
      headers: { Authorization: "Bearer partner-token" },
    });

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      error: "Partner OAuth bearer tokens have been removed. Use a WorkOS partner API key.",
    });
  });
});
