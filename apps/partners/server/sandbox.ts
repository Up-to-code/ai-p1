import { partnerBackendRefs, partnerMutation, partnerQuery } from "@/server/partnerBackendRefs";

export type SandboxInfo = {
  organization: {
    id: string;
    organizationId: string;
    name: string;
    createdAt: number;
    updatedAt: number;
  } | null;
  scopes: string[];
  logs: Array<{
    _id?: string;
    id?: string;
    method: string;
    path: string;
    status: number;
    latencyMs: number;
    scopes: string[];
    input?: unknown;
    response?: unknown;
    error?: string;
    createdAt: number;
  }>;
};

export const sandboxRepository = {
  async get(token: string, appId: string) {
    return partnerQuery<SandboxInfo>(token, partnerBackendRefs.sandbox.getSandboxForApp, { appId });
  },

  async ensure(token: string, appId: string) {
    return partnerMutation<{ organizationId: string; name: string; scopes: string[] }>(
      token,
      partnerBackendRefs.sandbox.ensureSandboxForApp,
      { appId },
    );
  },
};
