import { NextResponse, type NextRequest } from "next/server";
import {
  mobileAuthErrorMessage,
  mobileEmailVerificationChallenge,
  signInWithMobilePassword,
} from "@/server/auth/workos/mobile-password";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { email?: unknown; password?: unknown; returnTo?: unknown };
  try {
    const session = await signInWithMobilePassword({
      email: body.email,
      password: body.password,
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return NextResponse.json({ ok: true, session });
  } catch (error) {
    const emailVerification = mobileEmailVerificationChallenge(error);
    if (emailVerification) {
      return NextResponse.json({ ok: false, emailVerification }, { status: 409 });
    }
    return NextResponse.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Qentrah password sign in failed."),
    }, { status: 400 });
  }
}
