import { readBrandEnv } from "@anan/brand-identity";

export function getMissingPartnersProductionEnv() {
  if (process.env.NODE_ENV !== "production") return [];

  const missing: string[] = [];
  for (const key of ["DATABASE_URL", "BETTER_AUTH_SECRET", "PARTNER_SIGNUP_BRIDGE_SECRET", "PARTNERS_REVIEW_CALLBACK_TOKEN"]) {
    if (!process.env[key]?.trim()) missing.push(key);
  }
  if (!readBrandEnv("WORKSPACE_SERVICE_TOKEN", process.env)) {
    missing.push("QENTRAH_WORKSPACE_SERVICE_TOKEN");
  }
  return missing;
}

export function assertPartnersProductionEnv() {
  const missing = getMissingPartnersProductionEnv();
  if (missing.length > 0) {
    throw new Error(`Missing Partners production environment: ${missing.join(", ")}`);
  }
}
