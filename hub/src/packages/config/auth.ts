import { envReader } from "./env-reader";

type AuthConfigMode = "runtime" | "schema";

const siteUrl = envReader.read(
  "SITE_URL",
  envReader.read(
    "BETTER_AUTH_URL",
    envReader.read("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  ),
);

const schemaOnlySecret = "schema-generation-only-secret-00000000";

export function getAuthRuntimeConfig(mode: AuthConfigMode) {
  const secret =
    mode === "runtime"
      ? envReader.min("BETTER_AUTH_SECRET", envReader.read("BETTER_AUTH_SECRET", ""), 32)
      : schemaOnlySecret;

  return {
    siteUrl,
    secret,
    verbose: envReader.read("BETTER_AUTH_VERBOSE", "false") === "true",
    googleClientId: envReader.read("GOOGLE_CLIENT_ID", ""),
    googleClientSecret: envReader.read("GOOGLE_CLIENT_SECRET", ""),
  };
}
