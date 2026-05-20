import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { demoBrandConfig, demoConfig } from "@/lib/config";
import { oauthStateCookieName, pkceVerifierCookieName, secureCookieOptions } from "@/lib/cookies";
import { signValue } from "@/lib/crypto";
import { buildAuthorizeUrl } from "@/lib/oauth";
import { oauthDebug } from "@/lib/oauth-debug";
import { createPkcePair } from "@/lib/pkce";

export async function GET() {
  const config = demoConfig();
  const state = crypto.randomUUID();
  const pkce = await createPkcePair();
  const redirectUri = `${config.partnerAppUrl}${demoBrandConfig.oauthCallbackPath}`;
  const cookieStore = await cookies();

  cookieStore.set(oauthStateCookieName, await signValue(state, config.sessionSecret), {
    ...secureCookieOptions,
    maxAge: 10 * 60,
  });
  cookieStore.set(pkceVerifierCookieName, await signValue(pkce.verifier, config.sessionSecret), {
    ...secureCookieOptions,
    maxAge: 10 * 60,
  });

  const authorizeUrl = buildAuthorizeUrl({
    workspaceBaseUrl: config.workspaceBaseUrl,
    clientId: config.clientId,
    redirectUri,
    state,
    codeChallenge: pkce.challenge,
  });

  oauthDebug("demo.oauth.start.redirect", {
    workspaceBaseUrl: config.workspaceBaseUrl,
    clientId: config.clientId,
    redirectUri,
    scopeCount: new URL(authorizeUrl).searchParams.get("scope")?.split(/\s+/u).filter(Boolean).length ?? 0,
    state,
    codeChallenge: pkce.challenge,
  });

  return NextResponse.redirect(authorizeUrl);
}
