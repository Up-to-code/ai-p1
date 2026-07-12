import { requireScopes } from "../server/guards.js";
import type { AuthContext } from "../types/index.js";
import { verifyAccessToken, type VerifyAccessTokenOptions } from "./verify-access-token.js";

export async function verifyAccessTokenScopes(
  token: string,
  options: VerifyAccessTokenOptions & { scopes: string[] },
): Promise<AuthContext> {
  const context = await verifyAccessToken(token, options);
  return requireScopes(context, options.scopes);
}
