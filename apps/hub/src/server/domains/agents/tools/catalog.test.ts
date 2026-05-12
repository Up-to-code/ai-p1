import { describe, expect, it } from "vitest";
import { allowedAgentTools, canUseAgentTool, type AgentPermission } from "./catalog";

const ownerSafePermissions: AgentPermission[] = [
  { resource: "organization", actions: ["read"] },
  { resource: "client", actions: ["read", "create", "update", "delete"] },
  { resource: "calendar", actions: ["read", "create", "update", "delete"] },
];

describe("agent tool catalog", () => {
  it("allows safe owner-scoped tools", () => {
    expect(
      canUseAgentTool(ownerSafePermissions, {
        name: "calendar_create",
        resource: "calendar",
        action: "create",
      }),
    ).toBe(true);
  });

  it("denies missing team member permissions", () => {
    expect(
      canUseAgentTool([{ resource: "client", actions: ["read"] }], {
        name: "clients_update",
        resource: "client",
        action: "update",
      }),
    ).toBe(false);
  });

  it("keeps organization writes out of allowed tools", () => {
    const tools = allowedAgentTools([
      { resource: "organization", actions: ["read", "update", "delete"] },
    ]);

    expect(tools.every((tool) => tool.resource !== "organization" || tool.action === "read")).toBe(true);
  });
});
