import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { getToken } from "@convex-dev/better-auth/utils";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;

function bearerSessionHeaders(bearerToken: string) {
  const headers = new Headers();
  headers.set("cookie", `better-auth.session_token=${bearerToken}`);
  headers.set("accept-encoding", "identity");
  return headers;
}

export async function authenticateMcpRequest(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  try {
    const result = await getToken(convexSiteUrl, bearerSessionHeaders(bearerToken));
    if (!result.token) return undefined;

    return {
      token: bearerToken,
      clientId: "mcp-client",
      scopes: ["profile", "email"],
      extra: { convexToken: result.token },
    };
  } catch {
    return undefined;
  }
}
