import { prisma } from "@/lib/prisma";
import { auditPartnerEvent, ensurePartnerProfile } from "@/server/partnerRuntime";
import type { PartnerAccountView } from "@/types/account";

function toMillis(value: Date) {
  return value.getTime();
}

export const partnerAccountRepository = {
  async getCurrent(authSubject: string): Promise<PartnerAccountView> {
    const profile = await ensurePartnerProfile({ subject: authSubject });
    const organization = await prisma.programmerOrganization.findUnique({
      where: { ownerAuthSubject: authSubject },
    });
    return {
      identity: {
        subject: authSubject,
        name: profile.name ?? undefined,
        email: profile.email ?? undefined,
      },
      profile: {
        id: profile.id,
        authSubject: profile.authSubject,
        name: profile.name ?? null,
        email: profile.email ?? null,
        createdAt: toMillis(profile.createdAt),
        updatedAt: toMillis(profile.updatedAt),
      },
      organization: organization
        ? {
            id: organization.id,
            ownerAuthSubject: organization.ownerAuthSubject,
            tenantOrganizationId: organization.tenantOrganizationId ?? null,
            name: organization.name,
            type: "programmer",
            countryCode: organization.countryCode,
            createdAt: toMillis(organization.createdAt),
            updatedAt: toMillis(organization.updatedAt),
          }
        : null,
    };
  },

  async updateProfile(authSubject: string, input: { name: string }) {
    await ensurePartnerProfile({ subject: authSubject });
    await prisma.partnerProfile.update({
      where: { authSubject },
      data: { name: input.name.trim() },
    });
    await auditPartnerEvent({
      actorAuthSubject: authSubject,
      eventType: "partner_profile.updated",
      payload: { fields: ["name"] },
    });
    return { ok: true as const };
  },

  async updateOrganization(authSubject: string, input: { name: string; countryCode: string }) {
    await ensurePartnerProfile({ subject: authSubject });
    const existing = await prisma.programmerOrganization.findUnique({
      where: { ownerAuthSubject: authSubject },
    });
    if (!existing) throw new Error("PROGRAMMER_ORGANIZATION_REQUIRED");

    await prisma.programmerOrganization.update({
      where: { ownerAuthSubject: authSubject },
      data: {
        name: input.name.trim(),
        countryCode: input.countryCode.trim().toUpperCase(),
        type: "programmer",
      },
    });
    await auditPartnerEvent({
      actorAuthSubject: authSubject,
      eventType: "partner_organization.updated",
      payload: { organizationId: existing.id, type: "programmer" },
    });
    return { ok: true as const };
  },
};
