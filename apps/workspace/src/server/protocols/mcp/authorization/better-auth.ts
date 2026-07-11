import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { verifyAccessToken } from "better-auth/oauth2";

const appUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/u, "");
const issuer = `${appUrl}/api/auth`;
const audience = `${appUrl}/mcp`;

function tokenScopes(payload: Record<string, unknown>) {
  const scope = payload.scope;
  if (typeof scope === "string") return scope.split(/\s+/u).filter(Boolean);
  if (Array.isArray(scope)) return scope.filter((value): value is string => typeof value === "string");
  return [];
}

export async function authenticateMcpRequest(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  try {
    const payload = await verifyAccessToken(bearerToken, {
      verifyOptions: { issuer, audience },
      scopes: ["mcp:read"],
    });
    const scopes = tokenScopes(payload as Record<string, unknown>);

    return {
      token: bearerToken,
      clientId: typeof payload.azp === "string" ? payload.azp : "mcp-client",
      scopes,
      extra: { convexToken: bearerToken },
    };
  } catch {
    return undefined;
  }
}
