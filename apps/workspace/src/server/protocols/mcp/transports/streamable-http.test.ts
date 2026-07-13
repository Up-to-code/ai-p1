import type { McpGrantAuthorization } from "@qentrah/mcp-contracts";
import { describe, expect, it, vi } from "vitest";
import { handleStreamableMcpRequest } from "./streamable-http";

const grant: McpGrantAuthorization = {
  grantId: "grant_1",
  organizationId: "org_1",
  clientId: "client_1",
  userId: "user_1",
  expiresAt: 2_000_000_000_000,
  tools: [{
    name: "tasks_list",
    title: "List tasks",
    description: "List workspace tasks.",
    resource: "task",
    action: "read",
  }],
};

function protocolRequest(method: string, id: number, params: Record<string, unknown> = {}) {
  return new Request("https://app.qentrah.com/api/mcp", {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
}

describe("stateless Streamable HTTP MCP", () => {
  it("advertises tools capability during initialization", async () => {
    const response = await handleStreamableMcpRequest(
      protocolRequest("initialize", 1, {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0.0" },
      }),
      grant,
      { executeTool: vi.fn() },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: { capabilities: { tools: {} } },
    });
  });

  it("registers only grant-approved tools plus the grant inspector", async () => {
    const response = await handleStreamableMcpRequest(
      protocolRequest("tools/list", 2),
      grant,
      { executeTool: vi.fn() },
    );

    expect(response.status).toBe(200);
    const payload = await response.json() as { result: { tools: Array<{ name: string }> } };
    expect(payload.result.tools.map((tool) => tool.name)).toEqual(["tasks_list", "tools_allowed"]);
  });

  it("dispatches an approved tool through the request-scoped Convex executor", async () => {
    const executeTool = vi.fn().mockResolvedValue({ tasks: [{ id: "task_1" }] });
    const response = await handleStreamableMcpRequest(
      protocolRequest("tools/call", 3, {
        name: "tasks_list",
        arguments: { limit: 5 },
      }),
      grant,
      { executeTool },
    );

    expect(response.status).toBe(200);
    expect(executeTool).toHaveBeenCalledWith("tasks_list", { limit: 5 });
    const payload = await response.json() as {
      result: { content: Array<{ type: string; text: string }> };
    };
    expect(JSON.parse(payload.result.content[0]?.text ?? "null")).toEqual({
      tasks: [{ id: "task_1" }],
    });
  });
});
