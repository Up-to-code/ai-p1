import { envReader } from "./env-reader";
import { convexRuntimeConfig } from "./public";

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

const fallbackSiteUrl = normalizeUrl(
  envReader.read(
    "SITE_URL",
    envReader.read(
      "NEXT_PUBLIC_SITE_URL",
      convexRuntimeConfig.siteUrl || "http://localhost:3000",
    ),
  ),
);

export const workosRuntimeConfig = {
  enabled: envReader.read("WORKOS_AUTH_ENABLED", "false") === "true",
  apiKey: envReader.read("WORKOS_API_KEY", ""),
  clientId: envReader.read("WORKOS_CLIENT_ID", ""),
  webhookSecret: envReader.read("WORKOS_WEBHOOK_SECRET", ""),
  cookiePassword: envReader.read("WORKOS_COOKIE_PASSWORD", ""),
  callbackUrl: envReader.read(
    "WORKOS_CALLBACK_URL",
    `${fallbackSiteUrl}/callback`,
  ),
  mobileCallbackUrl: envReader.read(
    "WORKOS_MOBILE_CALLBACK_URL",
    "qentrah:///auth-callback",
  ),
  logoutReturnUrl: envReader.read(
    "WORKOS_LOGOUT_RETURN_URL",
    `${fallbackSiteUrl}/en/sign-in`,
  ),
  postLoginUrl: envReader.read("WORKOS_POST_LOGIN_URL", `${fallbackSiteUrl}/en`),
  issuer: envReader.read("WORKOS_JWT_ISSUER", "https://api.workos.com"),
  cookieDomain: envReader.read("WORKOS_COOKIE_DOMAIN", ""),
  cookieSecure: envReader.read("WORKOS_COOKIE_SECURE", "true") !== "false",
  apiBaseUrl: envReader.read("WORKOS_API_BASE_URL", "https://api.workos.com"),
};
