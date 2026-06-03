import { NextResponse, type NextRequest } from "next/server";
import { confirmMobileEmailVerification, mobileAuthErrorMessage } from "@/server/auth/workos/mobile-password";

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as {
    code?: unknown;
    pendingAuthenticationToken?: unknown;
  };

  try {
    const session = await confirmMobileEmailVerification({
      code: body.code,
      pendingAuthenticationToken: body.pendingAuthenticationToken,
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Email verification could not be completed."),
    }, { status: 400 });
  }
}
