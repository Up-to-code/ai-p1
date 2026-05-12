import { cookies } from "next/headers";
import { secureCookieOptions, tokenCookieName } from "./cookies";
import { decryptJson, encryptJson } from "./crypto";
import { requiredEnv } from "./config";
import type { OAuthTokens } from "./oauth";

export type TokenSession = OAuthTokens & {
  organizationId?: string;
};

export async function storeTokenSession(tokens: TokenSession) {
  const encrypted = await encryptJson(tokens, requiredEnv("SESSION_SECRET"));
  (await cookies()).set(tokenCookieName, encrypted, {
    ...secureCookieOptions,
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function readTokenSession() {
  const cookieStore = await cookies();
  return decryptJson<TokenSession>(cookieStore.get(tokenCookieName)?.value, requiredEnv("SESSION_SECRET"));
}

export async function clearTokenSession() {
  (await cookies()).delete(tokenCookieName);
}
