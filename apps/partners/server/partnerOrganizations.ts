import { prisma } from "@/lib/prisma";
import { auditPartnerEvent, ensurePartnerProfile, randomToken } from "@/server/partnerRuntime";

export function isExistingPartnerOrganizationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return message.includes("ORGANIZATION_EXISTS") || message.includes("already has an organization");
}

export async function ensureCurrentPartnerProfile(authSubject: string) {
  await ensurePartnerProfile({ subject: authSubject });
  return { ok: true as const };
}

export async function createProgrammerOrganizationForCurrentPartner(
  authSubject: string,
  input: Record<string, unknown>,
) {
  await ensurePartnerProfile({ subject: authSubject });
  const existing = await prisma.programmerOrganization.findUnique({
    where: { ownerAuthSubject: authSubject },
  });
  if (existing) return { organizationId: existing.id };

  const name = String(input.name ?? "").trim();
  const countryCode = String(input.countryCode ?? "").trim().toUpperCase();
  const tenantOrganizationId = randomToken("programmer_org", 12);
  const organization = await prisma.programmerOrganization.create({
    data: {
      ownerAuthSubject: authSubject,
      tenantOrganizationId,
      name,
      type: "programmer",
      countryCode,
    },
  });
  await auditPartnerEvent({
    actorAuthSubject: authSubject,
    eventType: "partner_organization.created",
    payload: { organizationId: organization.id, tenantOrganizationId, type: "programmer" },
  });
  return { organizationId: organization.id };
}
