import { describe, expect, it } from "vitest";
import {
  hasMcpPermission,
  mcpPermissionRecord,
  mcpRoleCanUseAction,
  mcpRoleList,
  parseMcpCustomPermission,
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

  it("parses comma-separated dev identity role strings", () => {
    expect(mcpRoleList("owner, custom , ,member")).toEqual(["owner", "custom", "member"]);
  });

  it("preserves default role permissions before custom role permissions", () => {
    const custom = new Map([
      ["custom", parseMcpCustomPermission(JSON.stringify({ project: ["read"] }))],
      ["member", parseMcpCustomPermission(JSON.stringify({ project: ["delete"] }))],
    ]);

    expect(mcpRoleCanUseAction("owner", custom, "project", "delete")).toBe(true);
    expect(mcpRoleCanUseAction("custom", custom, "project", "read")).toBe(true);
    expect(mcpRoleCanUseAction("member", custom, "project", "delete")).toBe(false);
  });

  it("treats malformed custom permission JSON as empty", () => {
    expect(parseMcpCustomPermission("{")).toEqual({});
  });
});
