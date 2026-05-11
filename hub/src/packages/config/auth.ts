import { envReader } from "./env-reader";

type AuthConfigMode = "runtime" | "schema";

const productionSiteUrl = "https://anan-0-1-2.vercel.app";

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "";
  }

  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

const siteUrl = envReader.read(
  "SITE_URL",
  envReader.read(
    "BETTER_AUTH_URL",
    envReader.read(
      "NEXT_PUBLIC_SITE_URL",
      normalizeUrl(
        envReader.read(
          "VERCEL_PROJECT_PRODUCTION_URL",
          envReader.read("VERCEL_URL", productionSiteUrl),
        ),
      ),
    ),
  ),
);

const schemaOnlySecret = "schema-generation-only-secret-00000000";
const trustedOrigins = Array.from(
  new Set(
    [
      productionSiteUrl,
      siteUrl,
      "http://localhost:3000",
      "http://localhost:3001",
      normalizeUrl(envReader.read("VERCEL_URL", "")),
    ].filter(Boolean),
  ),
);

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
  };
}
