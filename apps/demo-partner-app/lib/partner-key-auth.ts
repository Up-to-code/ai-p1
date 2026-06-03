import { demoBrandConfig, demoConfig, requestedScopes } from "./config";

export type PartnerKeyCallbackInput = {
  organizationId: string;
  partnerKey: string;
  keyId?: string;
  keyLast4?: string;
  scope?: string;
  expiresAt?: number;
};

function requiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function workspacePartnerAuthorizationUrl() {
  const config = demoConfig();
  const url = new URL("/en/integrations", config.workspaceBaseUrl);
  url.searchParams.set("partnerClientId", config.clientId);
  url.searchParams.set("returnTo", `${config.partnerAppUrl}${demoBrandConfig.authCallbackPath}`);
  url.searchParams.set("scopes", requestedScopes.join(" "));
  return url.toString();
}

export function parsePartnerKeyCallbackPayload(payload: Record<string, unknown>): PartnerKeyCallbackInput {
  const organizationId = requiredString(payload.organizationId ?? payload.organization_id);
  const partnerKey = requiredString(payload.partnerKey ?? payload.partner_key ?? payload.key);
  if (!organizationId) throw new Error("Missing organizationId from Workspace partner authorization.");
  if (!partnerKey) throw new Error("Missing WorkOS partner API key from Workspace partner authorization.");

  return {
    organizationId,
    partnerKey,
    keyId: requiredString(payload.keyId ?? payload.key_id),
    keyLast4: requiredString(payload.keyLast4 ?? payload.key_last4),
    scope: requiredString(payload.scope ?? payload.scopes),
    expiresAt: optionalNumber(payload.expiresAt ?? payload.expires_at),
  };
}

export function partnerKeySessionFromCallback(input: PartnerKeyCallbackInput) {
  return {
    accessToken: input.partnerKey,
    tokenType: "WorkOSPartnerApiKey" as const,
    organizationId: input.organizationId,
    obtainedAt: Date.now(),
    expiresAt: input.expiresAt,
    scope: input.scope,
    keyId: input.keyId,
    keyLast4: input.keyLast4,
  };
}
