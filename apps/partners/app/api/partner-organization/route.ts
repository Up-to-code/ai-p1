import { NextResponse, type NextRequest } from "next/server";
import { createdResponse, okResponse, safeJsonBody } from "@anan/web-foundation/api";
import { getToken } from "@/lib/auth-server";
import { validatePartnerOrganizationInput, type PartnerOrganizationInput } from "@/lib/partner-signup";
import {
  createProgrammerOrganizationForCurrentPartner,
  ensureCurrentPartnerProfile,
  isExistingPartnerOrganizationError,
} from "@/server/partnerOrganizations";

export async function POST(request: NextRequest) {
  try {
    const body = ((await safeJsonBody(request, {})) ?? {}) as PartnerOrganizationInput;
    const parsed = validatePartnerOrganizationInput(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "PARTNER_ORGANIZATION_INVALID", message: parsed.message },
        { status: 400 },
      );
    }

    const token = await getToken().catch(() => null);
    if (!token) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Sign in before creating a programmer organization." },
        { status: 401 },
      );
    }

    try {
      await ensureCurrentPartnerProfile(token);
      const result = await createProgrammerOrganizationForCurrentPartner(token, {
        name: parsed.value.name,
        countryCode: parsed.value.countryCode,
      });
      return createdResponse({ ok: true, result });
    } catch (error) {
      if (isExistingPartnerOrganizationError(error)) {
        return okResponse({ ok: true, alreadyExists: true });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "PARTNER_ORGANIZATION_FAILED",
        message: "Could not create the programmer organization. Please try again.",
      },
      { status: 400 },
    );
  }
}
