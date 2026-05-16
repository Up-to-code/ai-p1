import { NextResponse, type NextRequest } from "next/server";
import { partnerReviewRequestSchema } from "@qentrah/partner-workspace-sync";
import { assertPartnersAdminServiceToken, adminPartnerAppsRepository } from "@/server/adminPartnerApps";

type Params = { params: Promise<{ appId: string }> };

function adminError(error: unknown) {
  const message = error instanceof Error ? error.message : "Partners admin API failed.";
  return NextResponse.json({ error: message }, { status: message.includes("token") ? 401 : 400 });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    assertPartnersAdminServiceToken(request.headers);
    const { appId } = await params;
    const reviewer = request.headers.get("x-qentrah-admin-actor")?.trim() || "admin";
    const input = partnerReviewRequestSchema.parse(await request.json());
    return NextResponse.json({ app: await adminPartnerAppsRepository.review(appId, input, reviewer) });
  } catch (error) {
    return adminError(error);
  }
}
