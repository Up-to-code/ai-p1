import { readAuthEnv, type AuthRuntimeEnv } from "./env";

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
  const webClientId = readAuthEnv("ANAN_WEB_OIDC_CLIENT_ID", env);
  const adminClientId = readAuthEnv("ANAN_ADMIN_OIDC_CLIENT_ID", env);
  const externalAppClientId = readAuthEnv("ANAN_EXTERNAL_APPS_OIDC_CLIENT_ID", env);

  const clients: Array<TrustedOidcClient | null> = [
    webClientId
      ? {
          clientId: webClientId,
          clientSecret: readAuthEnv("ANAN_WEB_OIDC_CLIENT_SECRET", env),
          name: "Anan Web",
          redirectUrls: readCsv(readAuthEnv("ANAN_WEB_OIDC_REDIRECT_URIS", env)),
          type: "web" as const,
          skipConsent: true,
        }
      : null,
    adminClientId
      ? {
          clientId: adminClientId,
          clientSecret: readAuthEnv("ANAN_ADMIN_OIDC_CLIENT_SECRET", env),
          name: "Anan Admin",
          redirectUrls: readCsv(readAuthEnv("ANAN_ADMIN_OIDC_REDIRECT_URIS", env)),
          type: "web" as const,
          skipConsent: true,
        }
      : null,
    externalAppClientId
      ? {
          clientId: externalAppClientId,
          clientSecret: readAuthEnv("ANAN_EXTERNAL_APPS_OIDC_CLIENT_SECRET", env),
          name: "Anan External Apps",
          redirectUrls: readCsv(readAuthEnv("ANAN_EXTERNAL_APPS_OIDC_REDIRECT_URIS", env)),
          type: "web" as const,
          skipConsent: true,
        }
      : null,
  ];
  return clients.filter((client): client is TrustedOidcClient => Boolean(client));
}
