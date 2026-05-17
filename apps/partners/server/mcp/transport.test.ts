import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { handlePartnerMcp } from "./transport";

vi.mock("./connections", () => ({
  partnerMcpConnectionsRepository: {
    authenticate: vi.fn(async () => ({
      authSubject: "user_1",
      connection: {
        id: "mcp_1",
        permissions: [{ resource: "guidance", actions: ["read"] }],
      },
    })),
    markUsed: vi.fn(),
    log: vi.fn(),
  },
}));

describe("Partner MCP transport", () => {
  it("returns an MCP initialize response", async () => {
    const app = new Hono().post("/api/mcp/partner/:publicId/:secret", handlePartnerMcp);
    const response = await app.request("http://localhost:3002/api/mcp/partner/public/secret", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        capabilities: { tools: {} },
        serverInfo: { name: "qentrah-partners-mcp" },
      },
    });
  });

  it("lists tool definitions", async () => {
    const app = new Hono().post("/api/mcp/partner/:publicId/:secret", handlePartnerMcp);
    const response = await app.request("http://localhost:3002/api/mcp/partner/public/secret", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: "tools", method: "tools/list", params: {} }),
    });

    const payload = await response.json();
    expect(payload.result.tools.map((tool: { name: string }) => tool.name)).toContain("partner_apps_create");
    expect(payload.result.tools.map((tool: { name: string }) => tool.name)).toContain("partner_authorization_flow");
  });
});
