import { requireScopes } from "../server/guards";
import type { AuthContext } from "../types";
import { verifyAccessToken, type VerifyAccessTokenOptions } from "./verify-access-token";

export async function verifyAccessTokenScopes(
  token: string,
  options: VerifyAccessTokenOptions & { scopes: string[] },
): Promise<AuthContext> {
  const context = await verifyAccessToken(token, options);
  return requireScopes(context, options.scopes);
}
