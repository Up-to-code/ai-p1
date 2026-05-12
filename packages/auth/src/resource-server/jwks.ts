import { getJwksUrl } from "../config/issuer";

export function resolveJwksUrl(issuer: string, explicitJwksUrl?: string): string {
  return explicitJwksUrl ?? getJwksUrl(issuer);
}
