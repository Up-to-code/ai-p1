import { NextResponse, type NextRequest } from "next/server";
import { assertWorkOSConfigured, getWorkOSClient } from "@/server/auth/workos";
import {
  WORKOS_CODE_VERIFIER_COOKIE,
  WORKOS_RETURN_TO_COOKIE,
  WORKOS_STATE_COOKIE,
  workosTransientCookieOptions,
} from "@/server/auth/workos/cookies";
import { workosRuntimeConfig } from "@/packages/config";

function safeReturnTo(value: string | null) {
  if (!value) return "";
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  if (value.startsWith("/api/")) return "";
  return value;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  try {
    assertWorkOSConfigured();
    const organizationId = url.searchParams.get("organization_id") ?? undefined;
    const loginHint = url.searchParams.get("login_hint") ?? undefined;
    const screenHint = url.searchParams.get("screen_hint") === "sign-up" ? "sign-up" : "sign-in";
    const returnTo = safeReturnTo(url.searchParams.get("return_to"));

    const auth = await getWorkOSClient().userManagement.getAuthorizationUrlWithPKCE({
      provider: "authkit",
      clientId: workosRuntimeConfig.clientId,
      redirectUri: workosRuntimeConfig.callbackUrl,
      organizationId,
      loginHint,
      screenHint,
    });

    const response = NextResponse.redirect(auth.url);
    response.cookies.set(WORKOS_STATE_COOKIE, auth.state, workosTransientCookieOptions());
    response.cookies.set(WORKOS_CODE_VERIFIER_COOKIE, auth.codeVerifier, workosTransientCookieOptions());
    if (returnTo) {
      response.cookies.set(WORKOS_RETURN_TO_COOKIE, returnTo, workosTransientCookieOptions());
    }
    return response;
  } catch (error) {
    const fallback = new URL("/en/sign-in", request.url);
    fallback.searchParams.set("error", error instanceof Error ? error.message : "WorkOS login failed.");
    return NextResponse.redirect(fallback);
  }
}
