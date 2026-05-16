import { NextResponse, type NextRequest } from "next/server";
import { publishedPartnerAppsResponseSchema } from "@qentrah/partner-workspace-sync";
import { assertPlatformServiceToken, platformPartnerAppsRepository } from "@/server/platformApi";

function platformError(error: unknown) {
  const message = error instanceof Error ? error.message : "Partners platform API failed.";
  const status = message.includes("token") ? 401 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    assertPlatformServiceToken(request.headers);
    const url = new URL(request.url);
    const payload = await platformPartnerAppsRepository.listPublished({
      limit: Number(url.searchParams.get("limit") || "100"),
      cursor: url.searchParams.get("cursor") || undefined,
      updatedSince: url.searchParams.get("updatedSince") ? Number(url.searchParams.get("updatedSince")) : undefined,
    });
    return NextResponse.json(publishedPartnerAppsResponseSchema.parse(payload));
  } catch (error) {
    return platformError(error);
  }
}
