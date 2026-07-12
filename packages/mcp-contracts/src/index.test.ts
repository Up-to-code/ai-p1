import { describe, expect, it } from "vitest";
import { hasMcpPermission, type McpPermission } from "./index";

describe("MCP permission contracts", () => {
  it("matches only an explicitly granted resource action", () => {
    const permissions: McpPermission[] = [
      { resource: "task", actions: ["read", "create"] },
    ];

    expect(hasMcpPermission(permissions, "task", "read")).toBe(true);
    expect(hasMcpPermission(permissions, "task", "delete")).toBe(false);
    expect(hasMcpPermission(permissions, "client", "read")).toBe(false);
  });
});
