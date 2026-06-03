import { NextResponse, type NextRequest } from "next/server";
import { mobileAuthErrorMessage } from "@/server/auth/workos/mobile-password";
import { safeMobileReturnTo, startMobileOAuth } from "@/server/auth/workos/mobile-oauth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  try {
    const auth = await startMobileOAuth({
      organizationId: url.searchParams.get("organization_id") ?? undefined,
      loginHint: url.searchParams.get("login_hint") ?? undefined,
      provider: url.searchParams.get("provider"),
      returnTo: url.searchParams.get("return_to"),
      screenHint: url.searchParams.get("screen_hint") === "sign-up" ? "sign-up" : "sign-in",
    });

    return NextResponse.json({
      ok: true,
      url: auth.url,
      state: auth.state,
      codeVerifier: auth.codeVerifier,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Qentrah sign-in could not start."),
      returnTo: safeMobileReturnTo(url.searchParams.get("return_to")),
    }, { status: 400 });
  }
}
