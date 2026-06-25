import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("MCP link principal source guards", () => {
  it("keeps MCP links member-owned or organization-owned instead of platform-admin gated", () => {
    const source = read("convex/mcp/connections.ts");
    const lifecycle = read("convex/mcp/connectionLifecycle.ts");

    expect(source).not.toContain("assertPlatformAdmin");
    expect(source).toContain("principalType = args.input.principalType ?? \"user\"");
    expect(source).toContain("principalUserId: principalType === \"user\" ? user._id : undefined");
    expect(source).toContain("mcpConnectionPrincipalType(connection) === \"user\"");
    expect(source).toContain("canManageMcpConnections");
    expect(source).toContain("visibleMcpConnections(connections, { canManage, userId: user._id })");
    expect(lifecycle).toContain("mcpConnectionPrincipalType(connection) === \"organization\"");
    expect(lifecycle).toContain("(connection.principalUserId ?? connection.createdByUserId) === params.userId");
  });

  it("re-checks user principal permissions before exposing MCP tools", () => {
    const source = read("convex/mcp/connections.ts");
    const permissions = read("convex/mcp/connectionPermissions.ts");

    expect(source).toContain("filterLivePermissions");
    expect(source).toContain("canUserUseMcpAction");
    expect(source).toContain("principalType === \"organization\"");
    expect(source).toContain("hasMcpPermission(livePermissions, args.resource, args.action)");
    expect(permissions).toContain("hasMcpPermission");
    expect(source).toContain("permissions: livePermissions");
  });

  it("lets organization members create and edit permission-clamped agent links", () => {
    const organizationScreen = read("src/domains/organization/components/screens/organization-screen.tsx");
    const agentLinksPanel = read("src/domains/organization/components/panels/agent-links-panel.tsx");

    expect(organizationScreen).toContain("const canCreateAgentLinks = capabilities?.canReadOrganization ?? false");
    expect(agentLinksPanel).toContain("const [principalType, setPrincipalType]");
    expect(agentLinksPanel).toContain("principalType,");
    expect(agentLinksPanel).toContain("openEditAgentLinkDialog");
    expect(agentLinksPanel).toContain("permissions: selectedGrantablePermissions");
    expect(agentLinksPanel).toContain("clampAgentPermissionsToGrantable(cloneAgentPermissions(connection.permissions), grantablePermissions)");
  });

  it("keeps deleted MCP links as hidden drafts with creator attribution", () => {
    const convexSource = read("convex/mcp/connections.ts");
    const agentLinksPanel = read("src/domains/organization/components/panels/agent-links-panel.tsx");
    const agentPermissions = read("src/domains/organization/agent-permissions.ts");

    expect(convexSource).toContain('status: "draft"');
    expect(convexSource).toContain("mcpConnection.draft");
    expect(agentLinksPanel).toContain("agentConnectionProjection(connections, showDrafts)");
    expect(agentPermissions).toContain("const draftConnections = connections.filter((connection) => connection.status === \"draft\")");
    expect(agentLinksPanel).toContain("showDrafts");
    expect(agentLinksPanel).toContain("memberByUserId.get(connection.createdByUserId)");
    expect(agentLinksPanel).toContain("buttons.showDrafts");
  });
});
