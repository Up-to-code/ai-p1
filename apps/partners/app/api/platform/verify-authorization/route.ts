import { NextResponse, type NextRequest } from "next/server";
import {
  partnerAuthorizationVerificationRequestSchema,
  partnerAuthorizationVerificationResponseSchema,
} from "@qentrah/partner-workspace-sync";
import { assertPlatformServiceToken, platformPartnerAppsRepository } from "@/server/platformApi";

function platformError(error: unknown) {
  const message = error instanceof Error ? error.message : "Partners platform API failed.";
  const status = message.includes("token") ? 401 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    assertPlatformServiceToken(request.headers);
    const input = partnerAuthorizationVerificationRequestSchema.parse(await request.json());
    const result = await platformPartnerAppsRepository.verifyAuthorization(input);
    return NextResponse.json(partnerAuthorizationVerificationResponseSchema.parse(result));
  } catch (error) {
    return platformError(error);
  }
}
