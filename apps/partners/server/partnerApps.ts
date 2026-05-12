import { partnerBackendRefs, partnerMutation, partnerQuery } from "@/server/partnerBackendRefs";

export type PartnerAppStatus = "draft" | "pending_review" | "active" | "rejected" | "suspended";
export type PartnerAppClientType = "public" | "confidential";

export type PartnerAppSummary = {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  logoUrl?: string | null;
  clientType: PartnerAppClientType;
  status: PartnerAppStatus;
  hubPartnerAppId?: string | null;
  hubOauthClientId?: string | null;
  hubSyncStatus?: "not_synced" | "pending" | "synced" | "failed" | null;
  hubSyncError?: string | null;
  redirectUris: string[];
  allowedScopes: string[];
  authorizationExpiresAfterDays: number;
  reviewNotes?: string | null;
  submittedAt?: number | null;
  reviewedAt?: number | null;
  createdAt: number;
  updatedAt: number;
};

function isLegacyHomepageUrlValidatorError(error: unknown) {
  return error instanceof Error
    && error.message.includes("Object contains extra field")
    && error.message.includes("homepageUrl");
}

export const partnerAppsRepository = {
  async list(token: string) {
    return partnerQuery<PartnerAppSummary[]>(token, partnerBackendRefs.partnerApps.listPartnerApps);
  },

  async getById(token: string, appId: string) {
    const apps = await this.list(token);
    return apps.find((app) => app.id === appId || app.clientId === appId) ?? null;
  },

  async create(
    token: string,
    input: {
      name: string;
      publisherName: string;
      homepageUrl: string;
      iconUrl?: string;
      logoUrl?: string;
      clientType: PartnerAppClientType;
      redirectUris: string[];
      allowedScopes: string[];
    },
  ) {
    try {
      return await partnerMutation<{
        appId: string;
        clientId: string;
        clientSecret?: string;
      }>(token, partnerBackendRefs.partnerApps.createPartnerApp, input);
    } catch (error) {
      if (!isLegacyHomepageUrlValidatorError(error)) throw error;
      const { homepageUrl: _homepageUrl, ...legacyInput } = input;
      return await partnerMutation<{
        appId: string;
        clientId: string;
        clientSecret?: string;
      }>(token, partnerBackendRefs.partnerApps.createPartnerApp, legacyInput);
    }
  },

  async update(
    token: string,
    input: {
      appId: string;
      name: string;
      publisherName: string;
      homepageUrl: string;
      iconUrl?: string;
      logoUrl?: string;
      redirectUris: string[];
      allowedScopes: string[];
    },
  ) {
    try {
      await partnerMutation<{ ok: true }>(token, partnerBackendRefs.partnerApps.updatePartnerApp, input);
    } catch (error) {
      if (!isLegacyHomepageUrlValidatorError(error)) throw error;
      const { homepageUrl: _homepageUrl, ...legacyInput } = input;
      await partnerMutation<{ ok: true }>(token, partnerBackendRefs.partnerApps.updatePartnerApp, legacyInput);
    }
  },

  async submitForReview(token: string, appId: string) {
    await partnerMutation<{ ok: true }>(token, partnerBackendRefs.partnerApps.submitPartnerAppForReview, { appId });
  },

  async recordHubSyncResult(
    token: string,
    input: {
      appId: string;
      ok: boolean;
      hubPartnerAppId?: string;
      hubOauthClientId?: string;
      error?: string;
    },
  ) {
    await partnerMutation<{ ok: true }>(token, partnerBackendRefs.partnerApps.recordHubSyncResult, input);
  },
};
