const PRODUCTION_WORKSPACE_ORIGIN = "https://app.qentrah.com";
const PRODUCTION_ADMIN_ORIGIN = "https://admin.qentrah.com";

const LOCAL_TRUSTED_ORIGINS = ["http://localhost:3000", "http://localhost:3003"];

export type AdminSecurityConfig = {
  adminOrigin: string;
  workspaceOrigin: string;
  trustedOrigins: string[];
  hasAdminServiceToken: boolean;
  hasBetterAuthSecret: boolean;
  hasAdminSessionEncryptionKey: boolean;
  adminSessionEncryptionKeyValid: boolean;
  platformAdminEmails: string[];
};

function normalizeOrigin(value: string | undefined, fallback: string) {
  const trimmed = value?.trim().replace(/\/+$/u, "");
  if (!trimmed) return fallback;
  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function parseCsv(value: string | undefined) {
  return Array.from(new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean)));
}

function isProductionEnv(env: Record<string, string | undefined>) {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}

export function adminSecurityConfig(env: Record<string, string | undefined> = process.env): AdminSecurityConfig {
  const adminOrigin = normalizeOrigin(
    env.ADMIN_SITE_URL ?? env.NEXT_PUBLIC_ADMIN_SITE_URL,
    PRODUCTION_ADMIN_ORIGIN,
  );
  const workspaceOrigin = normalizeOrigin(
    env.WORKSPACE_API_BASE_URL ?? env.WORKSPACE_ORIGIN,
    PRODUCTION_WORKSPACE_ORIGIN,
  );
  const configuredTrustedOrigins = parseCsv(env.ADMIN_TRUSTED_ORIGINS).map((origin) => normalizeOrigin(origin, origin));
  const trustedOrigins = Array.from(new Set([
    workspaceOrigin,
    adminOrigin,
    ...(isProductionEnv(env) ? [] : LOCAL_TRUSTED_ORIGINS),
    ...configuredTrustedOrigins,
  ]));
  const adminSessionEncryptionKey = env.ADMIN_SESSION_ENCRYPTION_KEY?.trim() ?? "";

  return {
    adminOrigin,
    workspaceOrigin,
    trustedOrigins,
    hasAdminServiceToken: Boolean(env.WORKSPACE_ADMIN_SERVICE_TOKEN?.trim()),
    hasBetterAuthSecret: Boolean(env.BETTER_AUTH_SECRET?.trim()),
    hasAdminSessionEncryptionKey: Boolean(adminSessionEncryptionKey),
    adminSessionEncryptionKeyValid: adminSessionEncryptionKey.length === 0 || adminSessionEncryptionKey.length >= 32,
    platformAdminEmails: parseCsv(env.PLATFORM_ADMIN_EMAILS).map((email) => email.toLowerCase()),
  };
}

export function redactSecret(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "not configured";
  if (trimmed.length <= 8) return "configured";
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}
