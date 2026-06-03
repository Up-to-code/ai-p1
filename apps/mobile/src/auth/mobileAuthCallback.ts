import * as Linking from "expo-linking";

const mobileAuthScheme = "qentrah";
const mobileAuthCallbackPath = "auth-callback";

export function getMobileAuthCallbackUrl() {
  return Linking.createURL(mobileAuthCallbackPath, {
    scheme: mobileAuthScheme,
    isTripleSlashed: true,
  });
}

export const MOBILE_AUTH_CALLBACK_URL = getMobileAuthCallbackUrl();

export function mobileAuthCallbackUrlWithQuery(query: URLSearchParams) {
  const queryString = query.toString();
  return queryString ? `${MOBILE_AUTH_CALLBACK_URL}?${queryString}` : MOBILE_AUTH_CALLBACK_URL;
}
