import { envReader } from "./env-reader";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

const fallbackSiteUrl = normalizeUrl(
  envReader.read(
    "SITE_URL",
    envReader.read(
      "BETTER_AUTH_URL",
      envReader.read("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
    ),
  ),
);

export const partnerAppsRuntimeConfig = {
  enabled: envReader.read("PARTNER_APPS_ENABLED", "true") !== "false",
  issuer: envReader.read("PARTNER_OAUTH_ISSUER", fallbackSiteUrl),
  oauthAudience: envReader.read(
    "PARTNER_OAUTH_AUDIENCE",
    `${fallbackSiteUrl}/api/v1/partner`,
  ),
  webhookSecretEncryptionKey: envReader.read(
    "PARTNER_WEBHOOK_SECRET_ENCRYPTION_KEY",
    "",
  ),
};
