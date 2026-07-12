import { getJwksUrl } from "../config/issuer.js";

export function resolveJwksUrl(issuer: string, explicitJwksUrl?: string): string {
  return explicitJwksUrl ?? getJwksUrl(issuer);
}
