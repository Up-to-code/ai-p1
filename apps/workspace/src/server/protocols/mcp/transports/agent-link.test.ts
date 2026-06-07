import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexHttp } from "@/server/convex/http-client";
import { handleMcpAgent, handleMcpMethodNotAllowed } from "./agent-link";

vi.mock("@convex/_generated/api", () => ({
  api: {
    mcp: {
      connections: {
        validateConnection: "mcp.connections.validateConnection",
      },
      tools: {
        callTool: "mcp.tools.callTool",
      },
    },
  },
}));

vi.mock("@/server/convex/http-client", () => ({
  convexHttp: {
    action: vi.fn(),
    query: vi.fn(),
  },
}));

const convexActionMock = vi.mocked(convexHttp.action);
const convexQueryMock = vi.mocked(convexHttp.query);

function appForMcpTests() {
  const app = new Hono();
  app.get("/api/mcp/agent/:publicId/:secret", handleMcpMethodNotAllowed);
  app.delete("/api/mcp/agent/:publicId/:secret", handleMcpMethodNotAllowed);
  app.post("/api/mcp/agent/:publicId/:secret", handleMcpAgent);
  return app;
}

function mcpRequest(method: string, params: Record<string, unknown> = {}, id = 1) {
  return {
    jsonrpc: "2.0",
    id,
    method,
    params,
  };
}

async function postMcp(body: Record<string, unknown>) {
  return appForMcpTests().request("/api/mcp/agent/public_1/secret_1", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(body),
  });
}

describe("MCP agent link transport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    convexQueryMock.mockResolvedValue({
      ok: true,
      organizationId: "org_1",
      connectionId: "connection_1",
      keyId: "key_1",
      name: "Client operator",
      instructions: "Only work on active clients.",
      permissions: [
        { resource: "organization", actions: ["read"] },
        { resource: "client", actions: ["read"] },
      ],
    });
  });

  it("returns a JSON-RPC error for non-POST requests", async () => {
    const response = await appForMcpTests().request("/api/mcp/agent/public_1/secret_1");

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: expect.stringContaining("Use POST"),
      },
      id: null,
    });
  });

  it("rejects unavailable agent links with a JSON-RPC error", async () => {
    convexQueryMock.mockResolvedValueOnce({ ok: false, reason: "not_found" });

    const response = await postMcp(mcpRequest("tools/list"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Agent link is not available.",
      },
      id: null,
    });
  });

  it("handles initialize requests from stateless MCP clients", async () => {
    const response = await postMcp(
      mcpRequest("initialize", {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "vitest", version: "1.0.0" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        serverInfo: {
          name: "Qentrah Client operator",
          version: "1.0.0",
        },
      },
    });
  });

  it("lists only tools allowed by the connection permissions", async () => {
    const response = await postMcp(mcpRequest("tools/list"));

    expect(response.status).toBe(200);
    const body = await response.json();
    const names = body.result.tools.map((tool: { name: string }) => tool.name);

    expect(names).toContain("organization_info");
    expect(names).toContain("clients_list");
    expect(names).toContain("clients_get");
    expect(names).toContain("tools_allowed");
    expect(names).not.toContain("clients_create");
    expect(names).not.toContain("assets_list");
  });

  it("returns text content for successful tool calls", async () => {
    convexActionMock.mockResolvedValueOnce({ organization: { name: "Qentrah" } });

    const response = await postMcp(
      mcpRequest("tools/call", {
        name: "organization_info",
        arguments: {},
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        content: [
          {
            type: "text",
            text: expect.stringContaining("Qentrah"),
          },
        ],
      },
    });
  });

  it("converts Convex tool failures into MCP tool error content", async () => {
    convexActionMock.mockRejectedValueOnce(new Error("Client was not found."));

    const response = await postMcp(
      mcpRequest("tools/call", {
        name: "clients_get",
        arguments: { clientId: "client_1" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        isError: true,
        content: [
          {
            type: "text",
            text: "Client was not found.",
          },
        ],
      },
    });
  });
});
