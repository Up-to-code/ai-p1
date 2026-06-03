import { describe, expect, it } from "vitest";
import { z } from "zod";
import { mcpReadToolNames, mcpToolPermissionMap } from "../../../../../convex/mcp/tools";
import { allowedMcpTools, canUseMcpTool, getMcpToolDefinition, mcpToolCatalog } from "./catalog";
import { createMcpConnectionSchema } from "@/server/domains/mcpConnections/validation/mcp-connection.schema";

describe("MCP tool catalog", () => {
  it("filters tools by selected permissions", () => {
    const tools = allowedMcpTools([
      { resource: "member", actions: ["read"] },
      { resource: "integration", actions: ["read"] },
      { resource: "client", actions: ["read", "create"] },
      { resource: "calendar", actions: ["read"] },
    ]);

    expect(tools.map((tool) => tool.name)).toContain("members_list");
    expect(tools.map((tool) => tool.name)).toContain("integrations_list");
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
        { resource: "member", actions: ["read"] },
        { resource: "integration", actions: ["read"] },
        { resource: "client", actions: ["read", "create"] },
        { resource: "task", actions: ["read", "update"] },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("bounds list tool inputs for large workspaces", () => {
    const clientsList = getMcpToolDefinition("clients_list");
    const mediaList = getMcpToolDefinition("media_list");
    const clientLimit = clientsList?.inputSchema?.limit;
    const clientSearch = clientsList?.inputSchema?.search;
    const mediaLimit = mediaList?.inputSchema?.limit;

    expect(clientLimit).toBeDefined();
    expect(clientSearch).toBeDefined();
    expect(mediaLimit).toBeDefined();
    if (!clientLimit || !clientSearch || !mediaLimit) throw new Error("List tool schemas are missing.");

    expect(z.safeParse(clientLimit, 50).success).toBe(true);
    expect(z.safeParse(clientLimit, 51).success).toBe(false);
    expect(z.safeParse(clientSearch, "Ahmed").success).toBe(true);
    expect(z.safeParse(mediaLimit, 25).success).toBe(true);
  });

  it("keeps shared agent risk policy in front of future dangerous MCP tools", () => {
    expect(
      canUseMcpTool(
        [{ resource: "organization", actions: ["read", "update", "delete"] }],
        { resource: "organization", action: "update" },
      ),
    ).toBe(false);

    expect(
      canUseMcpTool(
        [{ resource: "member", actions: ["delete"] } as never],
        { resource: "member", action: "delete" } as never,
      ),
    ).toBe(false);
  });

  it("keeps the catalog aligned with Convex tool permissions and handlers", () => {
    const catalogNames = mcpToolCatalog.map((tool) => tool.name).sort();
    const permissionNames = Object.keys(mcpToolPermissionMap).sort();

    expect(permissionNames).toEqual(catalogNames);
    for (const tool of mcpToolCatalog) {
      expect(mcpToolPermissionMap[tool.name]).toEqual({
        resource: tool.resource,
        action: tool.action,
      });
    }

    const writeToolNames = catalogNames.filter((name) => !mcpReadToolNames.has(name));
    expect(writeToolNames).toEqual(
      expect.arrayContaining([
        "clients_create",
        "properties_update",
        "projects_delete",
        "calendar_create",
        "tasks_complete",
        "media_attach_url",
      ]),
    );
    expect(mcpReadToolNames.has("members_list")).toBe(true);
    expect(mcpReadToolNames.has("integrations_list")).toBe(true);
    expect(mcpToolCatalog.map((tool) => tool.name)).not.toContain("members_remove");
  });
});
