import { NextResponse, type NextRequest } from "next/server";
import { completeMobileOAuth } from "@/server/auth/workos/mobile-oauth";
import { mobileAuthErrorMessage, mobileEmailVerificationChallenge } from "@/server/auth/workos/mobile-password";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as {
    code?: unknown;
    codeVerifier?: unknown;
  };

  try {
    const tokens = await completeMobileOAuth({
      code: body.code,
      codeVerifier: body.codeVerifier,
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return NextResponse.json({ ok: true, ...tokens });
  } catch (error) {
    const emailVerification = mobileEmailVerificationChallenge(error);
    if (emailVerification) {
      return NextResponse.json({ ok: false, emailVerification }, { status: 409 });
    }
    return NextResponse.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Qentrah sign-in callback failed."),
    }, { status: 400 });
  }
}
