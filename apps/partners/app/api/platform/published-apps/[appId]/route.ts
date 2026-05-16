import { NextResponse, type NextRequest } from "next/server";
import { publishedPartnerAppSchema } from "@qentrah/partner-workspace-sync";
import { assertPlatformServiceToken, platformPartnerAppsRepository } from "@/server/platformApi";

type Params = { params: Promise<{ appId: string }> };

function platformError(error: unknown) {
  const message = error instanceof Error ? error.message : "Partners platform API failed.";
  const status = message.includes("token") ? 401 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    assertPlatformServiceToken(request.headers);
    const { appId } = await params;
    const app = await platformPartnerAppsRepository.getPublished(appId);
    if (!app) return NextResponse.json({ error: "Partner app is not published." }, { status: 404 });
    return NextResponse.json(
      { app: publishedPartnerAppSchema.parse(app) },
      {
        headers: {
          "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    return platformError(error);
  }
}
