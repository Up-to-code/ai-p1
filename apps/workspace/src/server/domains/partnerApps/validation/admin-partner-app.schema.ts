import {
  oauthRuntimeProjectionInputSchema,
  type OAuthRuntimeProjectionInput,
} from "@qentrah/partner-workspace-sync";
import { z } from "zod";
import { partnerAppScopes } from "@qentrah/partner-auth-core";

const partnerScopeSchema = z.enum(partnerAppScopes as [string, ...string[]]);

export const oauthClientRuntimeSyncSchema = oauthRuntimeProjectionInputSchema.extend({
  allowedScopes: z.array(partnerScopeSchema).min(1),
});

export type OAuthClientRuntimeSyncPayload = OAuthRuntimeProjectionInput;
