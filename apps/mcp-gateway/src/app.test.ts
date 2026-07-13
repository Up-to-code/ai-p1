import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  process.env.CONVEX_URL = "https://example.convex.cloud";
  process.env.MCP_RESOURCE_URL = "https://mcp.qentrah.com/mcp";
  process.env.BETTER_AUTH_URL = "https://app.qentrah.com/api/auth";
  delete process.env.OPENAI_APPS_CHALLENGE;
});

describe("MCP gateway", () => {
  it("serves a small public landing page at the deployment root", async () => {
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(await response.text()).toContain("Authorized remote access");
  });

  it("serves the OpenAI domain challenge as plain text when configured", async () => {
    process.env.OPENAI_APPS_CHALLENGE = "openai-verification-token";
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/.well-known/openai-apps-challenge");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe("openai-verification-token");
  });

  it("does not expose an unconfigured OpenAI domain challenge", async () => {
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/.well-known/openai-apps-challenge");
    expect(response.status).toBe(404);
  });

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

  it.each(["GET", "POST"])("requires OAuth for %s MCP transport", async (method) => {
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/mcp?profile=test-profile", { method });
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("oauth-protected-resource/mcp");
  });

  it("allows configured browser preflight without credentials", async () => {
    vi.resetModules();
    const { app } = await import("./app.js");
    const response = await app.request("/mcp", {
      method: "OPTIONS",
      headers: {
        origin: "https://app.qentrah.com",
        "access-control-request-method": "POST",
        "access-control-request-headers": "authorization,content-type,mcp-protocol-version",
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://app.qentrah.com");
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
