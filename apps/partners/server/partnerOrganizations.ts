import { partnerBackendRefs, partnerMutation } from "@/server/partnerBackendRefs";

export function isExistingPartnerOrganizationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return message.includes("ORGANIZATION_EXISTS") || message.includes("already has an organization");
}

export function createProgrammerOrganizationForCurrentPartner(
  token: string,
  input: Record<string, unknown>,
) {
  return partnerMutation(token, partnerBackendRefs.partnerOrganizations.createProgrammerOrganizationForCurrentPartner, input);
}

export async function ensureCurrentPartnerProfile(token: string) {
  return partnerMutation(token, partnerBackendRefs.partnerOrganizations.ensureCurrentPartnerProfile);
}
