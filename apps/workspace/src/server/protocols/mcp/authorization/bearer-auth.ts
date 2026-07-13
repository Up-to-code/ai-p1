import { verifyAccessToken } from "@qentrah/auth/resource-server";
import {
  readAuthCredential,
  type AuthCredential,
} from "@qentrah/auth/credentials";

export type McpBearerTopology = {
  authIssuer: string;
  jwksUrl: string;
  mcpResourceUrl: string;
};

export type McpBearerIdentity = Extract<AuthCredential, { kind: "bearer" }>;

/**
 * Verifies an external MCP bearer credential and rejects incomplete OAuth
 * identities. Session cookies are intentionally not considered credentials at
 * this protocol boundary.
 */
export async function verifyMcpBearer(
  authorization: string | null,
  topology: McpBearerTopology,
): Promise<McpBearerIdentity | null> {
  const credential = readAuthCredential(new Headers(
    authorization ? { authorization } : undefined,
  ));
  if (credential?.kind !== "bearer") return null;

  try {
    const context = await verifyAccessToken(credential.token, {
      issuer: topology.authIssuer,
      audience: topology.mcpResourceUrl,
      jwksUrl: topology.jwksUrl,
      scopes: ["mcp:read"],
    });
    const organizationId = context.organizationId?.trim() ?? "";
    const clientId = context.clientId?.trim() ?? "";
    if (!context.userId || !organizationId || !clientId) return null;

    return credential;
  } catch {
    return null;
  }
}
