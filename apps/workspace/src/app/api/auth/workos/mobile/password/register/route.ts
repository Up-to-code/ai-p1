import { NextResponse, type NextRequest } from "next/server";
import {
  mobileAuthErrorMessage,
  mobileEmailVerificationChallenge,
  registerWithMobilePassword,
} from "@/server/auth/workos/mobile-password";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as {
    email?: unknown;
    password?: unknown;
    name?: unknown;
    returnTo?: unknown;
  };
  try {
    const session = await registerWithMobilePassword({
      email: body.email,
      password: body.password,
      name: body.name,
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
      error: mobileAuthErrorMessage(error, "Qentrah password registration failed."),
    }, { status: 400 });
  }
}
