import { hc } from "hono/client";
import type { AppType } from "@/server/app";
import { apiRuntimeConfig } from "@/packages/config";
import type { UpdateOrganizationProfileValues } from "@/domains/organization/validation/organization.schema";

interface OrganizationProfilePatchClient {
  api: {
    v1: {
      organizations: {
        ":organizationId": {
          profile: {
            $patch: (input: {
              param: { organizationId: string };
              json: UpdateOrganizationProfileValues;
            }) => Promise<Response>;
          };
        };
      };
    };
  };
}

export const apiClient = hc<AppType>(
  apiRuntimeConfig.baseUrl,
) as OrganizationProfilePatchClient;
