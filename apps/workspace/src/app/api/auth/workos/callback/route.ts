import { NextResponse, type NextRequest } from "next/server";
import { assertWorkOSConfigured, getWorkOSClient } from "@/server/auth/workos";
import {
  WORKOS_ACCESS_TOKEN_COOKIE,
  WORKOS_CODE_VERIFIER_COOKIE,
  WORKOS_REFRESH_TOKEN_COOKIE,
  WORKOS_RETURN_TO_COOKIE,
  WORKOS_STATE_COOKIE,
  expiredWorkOSCookieOptions,
  workosSessionCookieOptions,
} from "@/server/auth/workos/cookies";
import { workosRuntimeConfig } from "@/packages/config";

export async function GET(request: NextRequest) {
  try {
    assertWorkOSConfigured();
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expectedState = request.cookies.get(WORKOS_STATE_COOKIE)?.value;
    const codeVerifier = request.cookies.get(WORKOS_CODE_VERIFIER_COOKIE)?.value;
    const returnTo = request.cookies.get(WORKOS_RETURN_TO_COOKIE)?.value;

    if (!code || !state || !expectedState || state !== expectedState || !codeVerifier) {
      return NextResponse.json({ error: "Invalid WorkOS callback state." }, { status: 400 });
    }

    const auth = await getWorkOSClient().userManagement.authenticateWithCode({
      clientId: workosRuntimeConfig.clientId,
      code,
      codeVerifier,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    const response = NextResponse.redirect(returnTo ? new URL(returnTo, request.url) : workosRuntimeConfig.postLoginUrl);
    response.cookies.set(WORKOS_ACCESS_TOKEN_COOKIE, auth.accessToken, workosSessionCookieOptions(60 * 30));
    response.cookies.set(WORKOS_REFRESH_TOKEN_COOKIE, auth.refreshToken, workosSessionCookieOptions(60 * 60 * 24 * 30));
    response.cookies.set(WORKOS_STATE_COOKIE, "", expiredWorkOSCookieOptions());
    response.cookies.set(WORKOS_CODE_VERIFIER_COOKIE, "", expiredWorkOSCookieOptions());
    response.cookies.set(WORKOS_RETURN_TO_COOKIE, "", expiredWorkOSCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "WorkOS callback failed." },
      { status: 500 },
    );
  }
}
