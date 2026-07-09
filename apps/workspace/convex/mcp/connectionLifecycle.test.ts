import { describe, expect, it } from "vitest";
import { mcpConnectionTtlMs, presentMcpConnection, visibleMcpConnections } from "./connectionLifecycle";
import type { Doc } from "../_generated/dataModel";

function connection(input: Partial<Doc<"organizationMcpConnections">>) {
  return {
    _id: "connection_1",
    _creationTime: 1,
    organizationId: "org_1",
    publicId: "public",
    keyId: "key",
    keyLast4: "1234",
    name: "Main",
    permissions: [],
    status: "active",
    createdByUserId: "user_1",
    createdAt: 1,
    updatedAt: 1,
    usageCount: 0,
    ...input,
  } as Doc<"organizationMcpConnections">;
}

describe("MCP connection lifecycle", () => {
  it("presents MCP connection fields with id alias", () => {
    expect(presentMcpConnection(connection({ expiresAt: 50 }))).toMatchObject({
      id: "connection_1",
      publicId: "public",
      keyLast4: "1234",
      principalType: "user",
      principalUserId: "user_1",
      scope: { type: "organization" },
      expiresAt: 50,
    });
  });

  it("presents missing legacy scope as Organization scope", () => {
    expect(presentMcpConnection(connection({ scope: undefined })).scope).toEqual({
      type: "organization",
    });
  });

  it("filters visible user connections unless the user can manage all links", () => {
    const own = connection({ _id: "own" as never, createdByUserId: "user_1", updatedAt: 1 });
    const other = connection({ _id: "other" as never, createdByUserId: "user_2", updatedAt: 2 });

    expect(visibleMcpConnections([own, other], { canManage: false, userId: "user_1" }).map((item) => item._id)).toEqual(["own"]);
    expect(visibleMcpConnections([own, other], { canManage: true, userId: "user_1" }).map((item) => item._id)).toEqual(["other", "own"]);
  });

  it("keeps organization principal connections visible to members", () => {
    const orgLink = connection({ _id: "org" as never, principalType: "organization", createdByUserId: "user_2" });
    const userLink = connection({ _id: "user" as never, principalType: "user", createdByUserId: "user_2" });

    expect(visibleMcpConnections([orgLink, userLink], { canManage: false, userId: "user_1" }).map((item) => item._id)).toEqual(["org"]);
  });

  it("derives token ttl from optional expiration", () => {
    expect(mcpConnectionTtlMs(undefined, 100)).toBeNull();
    expect(mcpConnectionTtlMs(150, 100)).toBe(50);
    expect(mcpConnectionTtlMs(50, 100)).toBe(0);
  });
});
