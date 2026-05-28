import { timingSafeEqual } from "node:crypto";
import { PartnerSyncError } from "@qentrah/partner-workspace-sync";

type ServiceTokenEnv = Record<string, string | undefined>;

function timingSafeTokenEqual(supplied: string, expected: string) {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function bearerOrHeader(headers: Headers, headerName: string) {
  const authorization = headers.get("authorization");
  return authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ||
    headers.get(headerName)?.trim() ||
    "";
}

export function partnersAdminServiceTokenFromEnv(env: ServiceTokenEnv = process.env) {
  return env.PARTNERS_ADMIN_SERVICE_TOKEN?.trim() || "";
}

export function platformServiceTokenFromEnv(env: ServiceTokenEnv = process.env) {
  return (
    env.PARTNERS_PLATFORM_SERVICE_TOKEN?.trim() ||
    env.QENTRAH_PLATFORM_SERVICE_TOKEN?.trim() ||
    env.WORKSPACE_SERVICE_TOKEN?.trim() ||
    ""
  );
}

export function assertPartnersAdminServiceToken(headers: Headers, env: ServiceTokenEnv = process.env) {
  const expected = partnersAdminServiceTokenFromEnv(env);
  const supplied = bearerOrHeader(headers, "x-qentrah-admin-token");
  if (!expected || !supplied || !timingSafeTokenEqual(supplied, expected)) {
    throw new Error("Invalid Partners admin service token.");
  }
}

export function assertPlatformServiceToken(headers: Headers, env: ServiceTokenEnv = process.env) {
  const expected = platformServiceTokenFromEnv(env);
  const supplied = bearerOrHeader(headers, "x-qentrah-platform-token");
  if (!expected || !supplied || !timingSafeTokenEqual(supplied, expected)) {
    throw new PartnerSyncError("PartnerCatalogUnavailable", "Invalid Partners platform service token.");
  }
}
