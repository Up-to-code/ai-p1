import { verifyAccessToken } from "@qentrah/auth/resource-server";
import type { GatewayConfig } from "./config.js";

export type GatewayIdentity = {
  token: string;
  userId: string;
  organizationId: string;
  clientId: string;
  scopes: string[];
  expiresAt?: number;
};

export async function verifyGatewayToken(
  authorization: string | undefined,
  config: GatewayConfig,
): Promise<GatewayIdentity | null> {
  const token = authorization?.match(/^Bearer\s+(.+)$/iu)?.[1]?.trim();
  if (!token) return null;

  try {
    const context = await verifyAccessToken(token, {
      issuer: config.issuer,
      audience: config.resourceUrl,
      scopes: ["mcp:read"],
    });
    const organizationId = context.organizationId ?? "";
    const clientId = context.clientId ?? "";
    if (!context.userId || !organizationId || !clientId) return null;

    return {
      token,
      userId: context.userId,
      organizationId,
      clientId,
      scopes: context.scopes,
      expiresAt: typeof context.claims.exp === "number" ? context.claims.exp : undefined,
    };
  } catch {
    return null;
  }
}
