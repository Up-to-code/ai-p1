import { readAuthEnv, type AuthRuntimeEnv } from "./env.js";
import { brandProductName } from "@qentrah/brand-identity";

export type TrustedOidcClient = {
  clientId: string;
  clientSecret?: string;
  name: string;
  redirectUrls: string[];
  type?: "public" | "web" | "native" | "user-agent-based";
  disabled?: boolean;
  skipConsent?: boolean;
  icon?: string;
  metadata?: Record<string, unknown> | null;
};

function readCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function resolveTrustedOidcClients(env: AuthRuntimeEnv = process.env): TrustedOidcClient[] {
  const webClientId = readAuthEnv("QENTRAH_WEB_OIDC_CLIENT_ID", env);
  const adminClientId = readAuthEnv("QENTRAH_ADMIN_OIDC_CLIENT_ID", env);
  const externalAppClientId = readAuthEnv("QENTRAH_EXTERNAL_APPS_OIDC_CLIENT_ID", env);

  const clients: Array<TrustedOidcClient | null> = [
    webClientId
      ? {
          clientId: webClientId,
          clientSecret: readAuthEnv("QENTRAH_WEB_OIDC_CLIENT_SECRET", env),
          name: brandProductName("workspace", "en"),
          redirectUrls: readCsv(readAuthEnv("QENTRAH_WEB_OIDC_REDIRECT_URIS", env)),
          type: "web" as const,
          skipConsent: true,
        }
      : null,
    adminClientId
      ? {
          clientId: adminClientId,
          clientSecret: readAuthEnv("QENTRAH_ADMIN_OIDC_CLIENT_SECRET", env),
          name: brandProductName("admin", "en"),
          redirectUrls: readCsv(readAuthEnv("QENTRAH_ADMIN_OIDC_REDIRECT_URIS", env)),
          type: "web" as const,
          skipConsent: true,
        }
      : null,
    externalAppClientId
      ? {
          clientId: externalAppClientId,
          clientSecret: readAuthEnv("QENTRAH_EXTERNAL_APPS_OIDC_CLIENT_SECRET", env),
          name: `${brandProductName("platform", "en")} External Apps`,
          redirectUrls: readCsv(readAuthEnv("QENTRAH_EXTERNAL_APPS_OIDC_REDIRECT_URIS", env)),
          type: "web" as const,
          skipConsent: true,
        }
      : null,
  ];
  return clients.filter((client): client is TrustedOidcClient => Boolean(client));
}
