import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("personal MCP link source guards", () => {
  it("keeps MCP links member-owned instead of platform-admin gated", () => {
    const source = read("convex/mcp/connections.ts");

    expect(source).not.toContain("assertPlatformAdmin");
    expect(source).toContain("connection.createdByUserId === user._id");
    expect(source).toContain("canManageMcpConnections");
    expect(source).toContain(".filter((connection) => canManage || connection.createdByUserId === user._id)");
  });

  it("re-checks creator permissions before exposing MCP tools", () => {
    const source = read("convex/mcp/connections.ts");

    expect(source).toContain("filterLivePermissions");
    expect(source).toContain("canUserUseMcpAction");
    expect(source).toContain("hasPermission(livePermissions, args.resource, args.action)");
    expect(source).toContain("permissions: livePermissions");
  });

  it("lets organization members create and edit permission-clamped agent links", () => {
    const source = read("src/domains/organization/components/organization-screens.tsx");

    expect(source).toContain("const canCreateAgentLinks = capabilities?.canReadOrganization ?? false");
    expect(source).toContain("openEditAgentLinkDialog");
    expect(source).toContain("permissions: selectedGrantablePermissions");
    expect(source).toContain("clampPermissionsToGrantable(clonePermissions(connection.permissions), grantablePermissions)");
  });

  it("keeps deleted MCP links as hidden drafts with creator attribution", () => {
    const convexSource = read("convex/mcp/connections.ts");
    const uiSource = read("src/domains/organization/components/organization-screens.tsx");

    expect(convexSource).toContain('status: "draft"');
    expect(convexSource).toContain("mcpConnection.draft");
    expect(uiSource).toContain("const draftConnections = connections.filter((connection) => connection.status === \"draft\")");
    expect(uiSource).toContain("showDrafts");
    expect(uiSource).toContain("memberByUserId.get(connection.createdByUserId)");
    expect(uiSource).toContain("buttons.showDrafts");
  });
});
