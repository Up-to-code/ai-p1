import { NextResponse, type NextRequest } from "next/server";
import { assertPartnersAdminServiceToken, adminPartnerAppsRepository } from "@/server/adminPartnerApps";

function adminError(error: unknown) {
  const message = error instanceof Error ? error.message : "Partners admin API failed.";
  return NextResponse.json({ error: message }, { status: message.includes("token") ? 401 : 400 });
}

export async function GET(request: NextRequest) {
  try {
    assertPartnersAdminServiceToken(request.headers);
    const url = new URL(request.url);
    return NextResponse.json(await adminPartnerAppsRepository.list({
      limit: Number(url.searchParams.get("limit") || "100"),
      cursor: url.searchParams.get("cursor") || undefined,
      search: url.searchParams.get("search") || undefined,
    }));
  } catch (error) {
    return adminError(error);
  }
}
