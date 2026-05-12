const CONVEX_URL_KEYS = ["CONVEX_URL", "NEXT_PUBLIC_CONVEX_URL"] as const;
const CONVEX_SITE_URL_KEYS = ["CONVEX_SITE_URL", "NEXT_PUBLIC_CONVEX_SITE_URL"] as const;

function hasAnyEnv(keys: readonly string[]) {
  return keys.some((key) => Boolean(process.env[key]?.trim()));
}

export function getMissingPartnersProductionEnv() {
  if (process.env.NODE_ENV !== "production") return [];

  const missing: string[] = [];
  if (!hasAnyEnv(CONVEX_URL_KEYS)) missing.push("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL");
  if (!hasAnyEnv(CONVEX_SITE_URL_KEYS)) missing.push("CONVEX_SITE_URL or NEXT_PUBLIC_CONVEX_SITE_URL");
  for (const key of ["BETTER_AUTH_SECRET", "PARTNER_SIGNUP_BRIDGE_SECRET", "ANAN_HUB_SERVICE_TOKEN", "PARTNERS_REVIEW_CALLBACK_TOKEN"]) {
    if (!process.env[key]?.trim()) missing.push(key);
  }
  return missing;
}

export function assertPartnersProductionEnv() {
  const missing = getMissingPartnersProductionEnv();
  if (missing.length > 0) {
    throw new Error(`Missing Partners production environment: ${missing.join(", ")}`);
  }
}
