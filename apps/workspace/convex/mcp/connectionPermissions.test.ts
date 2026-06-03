import { describe, expect, it } from "vitest";
import {
  hasMcpPermission,
  mcpPermissionRecord,
  mcpRoleCanUseAction,
  mcpRoleList,
} from "./connectionPermissions";

describe("MCP connection permissions", () => {
  it("normalizes permission records and checks requested actions", () => {
    const permissions = [
      { resource: "client" as const, actions: ["read" as const, "update" as const] },
      { resource: "media" as const, actions: ["create" as const] },
    ];

    expect(mcpPermissionRecord(permissions)).toEqual({
      client: ["read", "update"],
      media: ["create"],
    });
    expect(hasMcpPermission(permissions, "client", "read")).toBe(true);
    expect(hasMcpPermission(permissions, "client", "delete")).toBe(false);
  });

  it("parses comma-separated WorkOS role strings", () => {
    expect(mcpRoleList("owner, custom , ,member")).toEqual(["owner", "custom", "member"]);
  });

  it("preserves default role permissions before custom role permissions", () => {
    const custom = new Map([
      ["custom", { property: ["read" as const] }],
      ["member", { property: ["delete" as const] }],
    ]);

    expect(mcpRoleCanUseAction("owner", custom, "property", "delete")).toBe(true);
    expect(mcpRoleCanUseAction("custom", custom, "property", "read")).toBe(true);
    expect(mcpRoleCanUseAction("member", custom, "property", "delete")).toBe(false);
  });

});
