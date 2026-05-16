import { NextResponse, type NextRequest } from "next/server";
import { assertPartnersAdminServiceToken, adminPartnerAppsRepository } from "@/server/adminPartnerApps";

type Params = { params: Promise<{ appId: string }> };

function adminError(error: unknown) {
  const message = error instanceof Error ? error.message : "Partners admin API failed.";
  return NextResponse.json({ error: message }, { status: message.includes("token") ? 401 : 400 });
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    assertPartnersAdminServiceToken(request.headers);
    const { appId } = await params;
    const app = await adminPartnerAppsRepository.get(appId);
    if (!app) return NextResponse.json({ error: "Partner app not found." }, { status: 404 });
    return NextResponse.json({ app });
  } catch (error) {
    return adminError(error);
  }
}
