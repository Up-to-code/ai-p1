export const DEFAULT_AUTHORIZATION_EXPIRY_DAYS = 14;

export const AUTHORIZATION_CTA_COPY = "Authorize with Qentrah";

export function authorizationExpiryLabel(days = DEFAULT_AUTHORIZATION_EXPIRY_DAYS) {
  return `${days} days`;
}
