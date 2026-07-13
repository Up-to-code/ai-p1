import { verifyAccessToken } from "@qentrah/auth/resource-server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyMcpBearer } from "./bearer-auth";

vi.mock("@qentrah/auth/resource-server", () => ({
  verifyAccessToken: vi.fn(),
}));

const verifier = vi.mocked(verifyAccessToken);
const topology = {
  authIssuer: "https://app.qentrah.com/api/auth",
  jwksUrl: "https://app.qentrah.com/api/auth/jwks",
  mcpResourceUrl: "https://app.qentrah.com/api/mcp",
};

describe("MCP bearer authorization", () => {
  beforeEach(() => verifier.mockReset());

  it("accepts a complete OAuth MCP identity with the canonical audience", async () => {
    verifier.mockResolvedValue({
      token: "access-token",
      issuer: topology.authIssuer,
      audience: topology.mcpResourceUrl,
      subject: "user_1",
      userId: "user_1",
      clientId: "client_1",
      scopes: ["mcp:read", "mcp:write"],
      entitlements: [],
      organizationId: "org_1",
      organizationPermissions: [],
      isActive: true,
      claims: { sub: "user_1", exp: 2_000_000_000 },
    });

    await expect(verifyMcpBearer("Bearer access-token", topology)).resolves.toEqual({
      kind: "bearer",
      token: "access-token",
    });
    expect(verifier).toHaveBeenCalledWith("access-token", {
      issuer: topology.authIssuer,
      audience: topology.mcpResourceUrl,
      jwksUrl: topology.jwksUrl,
      scopes: ["mcp:read"],
    });
  });

  it("does not treat a Better Auth session cookie as an MCP credential", async () => {
    await expect(verifyMcpBearer("better-auth.session_token=session", topology)).resolves.toBeNull();
    expect(verifier).not.toHaveBeenCalled();
  });

  it("fails closed when the verified token lacks tenant or client claims", async () => {
    verifier.mockResolvedValue({
      subject: "user_1",
      userId: "user_1",
      clientId: null,
      scopes: ["mcp:read"],
      entitlements: [],
      organizationId: null,
      organizationPermissions: [],
      isActive: true,
      claims: { sub: "user_1" },
    });

    await expect(verifyMcpBearer("Bearer access-token", topology)).resolves.toBeNull();
  });
});
