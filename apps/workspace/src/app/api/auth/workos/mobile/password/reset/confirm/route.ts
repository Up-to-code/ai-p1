import { NextResponse, type NextRequest } from "next/server";
import { confirmMobilePasswordReset, mobileAuthErrorMessage } from "@/server/auth/workos/mobile-password";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as {
    token?: unknown;
    newPassword?: unknown;
  };

  try {
    await confirmMobilePasswordReset({
      token: body.token,
      newPassword: body.newPassword,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Password reset could not be completed."),
    }, { status: 400 });
  }
}
