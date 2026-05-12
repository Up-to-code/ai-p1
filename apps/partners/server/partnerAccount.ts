import { partnerBackendRefs, partnerMutation, partnerQuery } from "@/server/partnerBackendRefs";
import type { PartnerAccountView } from "@/types/account";

export const partnerAccountRepository = {
  getCurrent(token: string) {
    return partnerQuery<PartnerAccountView>(token, partnerBackendRefs.partnerAccount.getCurrentPartnerAccount);
  },

  updateProfile(token: string, input: { name: string }) {
    return partnerMutation<{ ok: true }>(token, partnerBackendRefs.partnerAccount.updateCurrentPartnerProfile, input);
  },

  updateOrganization(token: string, input: { name: string; countryCode: string }) {
    return partnerMutation<{ ok: true }>(token, partnerBackendRefs.partnerAccount.updateCurrentProgrammerOrganization, input);
  },
};
