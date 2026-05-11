import { describe, expect, it } from "vitest";
import { allowedMcpTools, canUseMcpTool, getMcpToolDefinition } from "./catalog";
import { createMcpConnectionSchema } from "@/server/domains/mcpConnections/validation/mcp-connection.schema";

describe("MCP tool catalog", () => {
  it("filters tools by selected permissions", () => {
    const tools = allowedMcpTools([
      { resource: "client", actions: ["read", "create"] },
      { resource: "calendar", actions: ["read"] },
    ]);

    expect(tools.map((tool) => tool.name)).toContain("clients_list");
    expect(tools.map((tool) => tool.name)).toContain("clients_create");
    expect(tools.map((tool) => tool.name)).toContain("calendar_list_today");
    expect(tools.map((tool) => tool.name)).not.toContain("clients_delete");
    expect(tools.map((tool) => tool.name)).not.toContain("calendar_create");
  });

  it("maps destructive apartment tools to delete permission only", () => {
    const tool = getMcpToolDefinition("properties_delete");

    expect(tool).toMatchObject({ resource: "property", action: "delete", destructive: true });
    expect(canUseMcpTool([{ resource: "property", actions: ["read", "update"] }], tool!)).toBe(false);
    expect(canUseMcpTool([{ resource: "property", actions: ["delete"] }], tool!)).toBe(true);
  });

  it("validates create connection payloads", () => {
    const result = createMcpConnectionSchema.safeParse({
      name: "Client operator",
      instructions: "Help with follow-ups.",
      permissions: [
        { resource: "client", actions: ["read", "create"] },
        { resource: "task", actions: ["read", "update"] },
      ],
    });

    expect(result.success).toBe(true);
  });
});
