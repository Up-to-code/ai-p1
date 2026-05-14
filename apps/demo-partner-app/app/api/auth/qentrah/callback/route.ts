import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { demoBrandConfig, demoConfig } from "@/lib/config";
import { oauthStateCookieName, pkceVerifierCookieName } from "@/lib/cookies";
import { verifySignedValue } from "@/lib/crypto";
import { organizationIdFromAccessToken } from "@/lib/jwt";
import { exchangeAuthorizationCode } from "@/lib/oauth";
import { storeTokenSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });
  if (!state) return NextResponse.json({ error: "missing_state" }, { status: 400 });

  const config = demoConfig();
  const cookieStore = await cookies();
  const expectedState = await verifySignedValue(cookieStore.get(oauthStateCookieName)?.value, config.sessionSecret);
  const codeVerifier = await verifySignedValue(cookieStore.get(pkceVerifierCookieName)?.value, config.sessionSecret);
  if (!expectedState || !codeVerifier || expectedState !== state) {
    return NextResponse.json({ error: "state_mismatch" }, { status: 400 });
  }

  const tokens = await exchangeAuthorizationCode({
    workspaceBaseUrl: config.workspaceBaseUrl,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: `${config.partnerAppUrl}${demoBrandConfig.oauthCallbackPath}`,
    code,
    codeVerifier,
  });

  await storeTokenSession({
    ...tokens,
    organizationId: tokens.organization_id ?? organizationIdFromAccessToken(tokens.access_token),
  });
  cookieStore.delete(oauthStateCookieName);
  cookieStore.delete(pkceVerifierCookieName);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
