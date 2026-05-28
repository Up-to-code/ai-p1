import { describe, expect, it } from "vitest";
import { getMcpToolDefinition } from "@/server/protocols/mcp/tools/catalog";
import { evaluateAgentToolPolicy } from "./tool-policy";

const organizationId = "org_123";

function decision(toolName: string | undefined, options: { adapter?: "agent" | "mcp"; permissions?: { resource: string; actions: string[] }[] } = {}) {
  const tool = toolName ? getMcpToolDefinition(toolName, { adapter: options.adapter ?? "mcp" }) : undefined;
  return evaluateAgentToolPolicy({
    adapter: options.adapter ?? "mcp",
    actorType: options.adapter === "agent" ? "user" : "mcpConnection",
    organizationId,
    tool,
    permissions: options.permissions as never,
  });
}

describe("agent tool policy gateway", () => {
  it("denies unknown tools by default", () => {
    expect(decision(undefined).state).toBe("blocked");
  });

  it("allows read tools with matching permission", () => {
    expect(decision("clients_list", { permissions: [{ resource: "client", actions: ["read"] }] }).state).toBe("allowed");
  });

  it("blocks tools without matching permission", () => {
    expect(decision("clients_list", { permissions: [{ resource: "client", actions: ["update"] }] }).state).toBe("blocked");
  });

  it("requires approval for external MCP writes", () => {
    expect(decision("calendar_create", { permissions: [{ resource: "calendar", actions: ["create"] }] }).state).toBe("requires_user_approval");
  });

  it("requires admin approval for high-impact actions", () => {
    expect(decision("clients_delete", { permissions: [{ resource: "client", actions: ["delete"] }] }).state).toBe("requires_admin_approval");
    expect(decision("organization_update_identity", {
      adapter: "agent",
      permissions: [{ resource: "organization", actions: ["update"] }],
    }).state).toBe("requires_admin_approval");
  });
});
