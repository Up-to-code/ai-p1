import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  process.env.CONVEX_URL = "https://example.convex.cloud";
  process.env.MCP_RESOURCE_URL = "https://mcp.qentrah.com/mcp";
  process.env.BETTER_AUTH_URL = "https://app.qentrah.com/api/auth";
});

describe("MCP gateway", () => {
  it("publishes protected resource metadata", async () => {
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/.well-known/oauth-protected-resource/mcp");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      resource: "https://mcp.qentrah.com/mcp",
      authorization_servers: ["https://app.qentrah.com/api/auth"],
    });
  });

  it("challenges unauthenticated MCP requests without exposing details", async () => {
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/mcp", { method: "POST", body: "{}" });
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("oauth-protected-resource/mcp");
    expect(await response.text()).not.toContain("stack");
  });

  it("proxies issuer-scoped Better Auth discovery", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(
      JSON.stringify({ issuer: "https://app.qentrah.com/api/auth" }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/.well-known/oauth-authorization-server");
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.qentrah.com/.well-known/oauth-authorization-server/api/auth",
      expect.any(Object),
    );
    fetchMock.mockRestore();
  });
});
