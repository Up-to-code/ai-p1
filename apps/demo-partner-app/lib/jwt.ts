function base64UrlDecodeText(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }
  const padded = value.replace(/-/gu, "+").replace(/_/gu, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

export function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    return JSON.parse(base64UrlDecodeText(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function organizationIdFromAccessToken(token: string) {
  const payload = decodeJwtPayload(token);
  const candidates = [
    payload?.organizationId,
    payload?.organization_id,
    payload?.orgId,
    payload?.org_id,
  ];
  return candidates.find((candidate): candidate is string => typeof candidate === "string" && candidate.length > 0);
}
