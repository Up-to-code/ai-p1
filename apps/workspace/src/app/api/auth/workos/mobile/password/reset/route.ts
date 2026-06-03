import { NextResponse, type NextRequest } from "next/server";
import { mobileAuthErrorMessage, requestMobilePasswordReset } from "@/server/auth/workos/mobile-password";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { email?: unknown };
  try {
    await requestMobilePasswordReset({ email: body.email });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Password reset could not be sent."),
    }, { status: 400 });
  }
}
