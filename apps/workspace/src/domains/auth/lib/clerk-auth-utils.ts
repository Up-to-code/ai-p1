export type ClerkSocialProvider = "google" | "apple";

export const clerkSocialProviderStrategies: Record<ClerkSocialProvider, `oauth_${string}`> = {
  apple: "oauth_apple",
  google: "oauth_google",
};

export const socialRedirectFallbackMs = 6000;

export type AuthErrorMessageKey =
  | "authStillLoading"
  | "callbackFailed"
  | "passwordNotEnabled"
  | "signInFailed"
  | "signUpFailed"
  | "socialProviderNotEnabled"
  | "socialStartFailed"
  | "unsupportedStep"
  | "verificationIncomplete"
  | "verifyFailed";

export type ExternalVerification = {
  externalVerificationRedirectURL?: URL | string | null;
} | null | undefined;

export function externalVerificationRedirectUrl(verification: ExternalVerification) {
  const value = verification?.externalVerificationRedirectURL;
  if (!value) return null;
  return value instanceof URL ? value.toString() : value;
}

export function assignExternalRedirect(url: string) {
  window.location.assign(url);
}

function clerkErrorText(error: unknown) {
  const candidate = error as {
    message?: string;
    errors?: Array<{ message?: string; longMessage?: string; code?: string }>;
  };
  const first = candidate?.errors?.[0];
  return first?.longMessage ?? first?.message ?? first?.code ?? candidate?.message ?? null;
}

export function localizedAuthError(
  error: unknown,
  fallback: string,
  t: (key: AuthErrorMessageKey) => string,
) {
  const message = clerkErrorText(error);
  if (!message) return fallback;
  const normalized = message.toLowerCase();

  if (normalized.includes("provider") || normalized.includes("client")) return t("socialProviderNotEnabled");
  if (normalized.includes("did not redirect")) return t("socialStartFailed");
  if (normalized.includes("loading")) return t("authStillLoading");
  if (normalized.includes("password") && normalized.includes("not enabled")) return t("passwordNotEnabled");
  if (normalized.includes("unsupported next step")) return t("unsupportedStep");
  if (normalized.includes("verification") && normalized.includes("not complete")) return t("verificationIncomplete");

  return message;
}

export function isAlreadySignedInError(error: unknown) {
  const message = clerkErrorText(error)?.toLowerCase() ?? "";
  return message.includes("already signed in");
}

export function toLocalizedPath(locale: string, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toRouterHref(locale: string, url: string) {
  const localePrefix = `/${locale}`;
  if (url === localePrefix) return "/";
  if (url.startsWith(`${localePrefix}/`)) return url.slice(localePrefix.length);
  return url;
}
