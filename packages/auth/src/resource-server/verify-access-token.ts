import { verifyAccessToken as verifyBetterAuthAccessToken } from "better-auth/oauth2";
import { authContextFromClaims } from "../server/claims.js";
import { AuthError, type AuthContext } from "../types/index.js";
import { resolveJwksUrl } from "./jwks.js";

export type VerifyAccessTokenOptions = {
  issuer: string;
  audience: string | string[];
  jwksUrl?: string;
  scopes?: string[];
};

export async function verifyAccessToken(token: string, options: VerifyAccessTokenOptions): Promise<AuthContext> {
  try {
    const claims = await verifyBetterAuthAccessToken(token, {
      jwksUrl: resolveJwksUrl(options.issuer, options.jwksUrl),
      scopes: options.scopes,
      verifyOptions: {
        issuer: options.issuer,
        audience: options.audience,
      },
    });
    return authContextFromClaims(claims, token);
  } catch (error) {
    throw new AuthError("INVALID_TOKEN", error instanceof Error ? error.message : "Invalid access token");
  }
}
