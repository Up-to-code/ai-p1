import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { demoBrandConfig, demoConfig } from "@/lib/config";
import { oauthStateCookieName, pkceVerifierCookieName, secureCookieOptions } from "@/lib/cookies";
import { signValue } from "@/lib/crypto";
import { buildAuthorizeUrl } from "@/lib/oauth";
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

  return NextResponse.redirect(buildAuthorizeUrl({
    workspaceBaseUrl: config.workspaceBaseUrl,
    clientId: config.clientId,
    redirectUri,
    state,
    codeChallenge: pkce.challenge,
  }));
}
