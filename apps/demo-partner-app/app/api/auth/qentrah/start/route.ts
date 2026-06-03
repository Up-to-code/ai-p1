import { NextResponse } from "next/server";
import { authDebug } from "@/lib/auth-debug";
import { workspacePartnerAuthorizationUrl } from "@/lib/partner-key-auth";

export async function GET() {
  const authorizeUrl = workspacePartnerAuthorizationUrl();

  authDebug("demo.workos_partner_key.start.redirect", {
    destination: authorizeUrl,
    scopeCount: new URL(authorizeUrl).searchParams.get("scopes")?.split(/\s+/u).filter(Boolean).length ?? 0,
  });

  return NextResponse.redirect(authorizeUrl);
}
