import { describe, expect, it } from "vitest";
import { assertOAuthToolPermission, authorizedTools } from "./oauthGrants";

describe("OAuth MCP grant authorization", () => {
  const permissions = [
    { resource: "organization" as const, actions: ["read" as const] },
    { resource: "task" as const, actions: ["read" as const, "create" as const] },
  ];

  it("exposes only tools covered by the exact resource matrix", () => {
    const names = authorizedTools(permissions).map((tool) => tool.name);
    expect(names).toContain("organization_info");
    expect(names).toContain("tasks_list");
    expect(names).toContain("tasks_create");
    expect(names).not.toContain("tasks_delete");
    expect(names).not.toContain("clients_list");
  });

  it("rejects a known tool when its action is not granted", () => {
    expect(() => assertOAuthToolPermission(permissions, "tasks_delete")).toThrow(/does not allow/);
    expect(() => assertOAuthToolPermission(permissions, "unknown_tool")).toThrow(/Unknown/);
  });
});
