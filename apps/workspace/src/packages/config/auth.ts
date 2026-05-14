import { envReader } from "./env-reader";

type AuthConfigMode = "runtime" | "schema";

const productionSiteUrl = "https://qentrah-0-1-2.vercel.app";

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "";
  }

  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function readUrl(key: string, fallback: string) {
  return normalizeUrl(envReader.read(key, fallback));
}

function parseTrustedOrigins(value: string) {
  return value
    .split(",")
    .map(normalizeUrl)
    .filter(Boolean);
}

const vercelProjectProductionUrl = readUrl(
  "VERCEL_PROJECT_PRODUCTION_URL",
  envReader.read("VERCEL_URL", productionSiteUrl),
);
const vercelUrl = readUrl("VERCEL_URL", "");
const publicSiteUrl = readUrl("NEXT_PUBLIC_SITE_URL", vercelProjectProductionUrl);
const siteUrl = readUrl(
  "SITE_URL",
  envReader.read("BETTER_AUTH_URL", publicSiteUrl),
);
const configuredTrustedOrigins = [
  ...parseTrustedOrigins(envReader.read("BETTER_AUTH_TRUSTED_ORIGINS", "")),
  ...parseTrustedOrigins(envReader.read("TRUSTED_ORIGINS", "")),
];

const schemaOnlySecret = "schema-generation-only-secret-00000000";
const trustedOrigins = Array.from(
  new Set(
    [
      productionSiteUrl,
      siteUrl,
      publicSiteUrl,
      vercelProjectProductionUrl,
      vercelUrl,
      "http://localhost:3000",
      "http://localhost:3001",
      ...configuredTrustedOrigins,
    ].filter(Boolean),
  ),
);

export function parsePlatformAdminEmails(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export const platformAdminEmails = parsePlatformAdminEmails(
  envReader.read("PLATFORM_ADMIN_EMAILS", ""),
);

export function isPlatformAdminEmail(
  email: string | null | undefined,
  allowlist = platformAdminEmails,
) {
  if (!email) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

export function getAuthRuntimeConfig(mode: AuthConfigMode) {
  const secret =
    mode === "runtime"
      ? envReader.min("BETTER_AUTH_SECRET", envReader.read("BETTER_AUTH_SECRET", ""), 32)
      : schemaOnlySecret;

  return {
    siteUrl,
    trustedOrigins,
    secret,
    verbose: envReader.read("BETTER_AUTH_VERBOSE", "false") === "true",
    googleClientId: envReader.read("GOOGLE_CLIENT_ID", ""),
    googleClientSecret: envReader.read("GOOGLE_CLIENT_SECRET", ""),
    platformAdminEmails,
  };
}
