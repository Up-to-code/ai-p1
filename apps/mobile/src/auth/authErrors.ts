const qentrahFallback = "Qentrah could not complete this request. Try again in a moment.";

const brandedReplacements: [RegExp, string][] = [
  [/workos authkit/giu, "Qentrah sign-in"],
  [/workos/giu, "Qentrah"],
  [/authkit/giu, "Qentrah sign-in"],
];

function cleanProviderNames(message: string) {
  return brandedReplacements.reduce(
    (next, [pattern, replacement]) => next.replace(pattern, replacement),
    message,
  );
}

export function authErrorMessage(error: unknown, fallback = qentrahFallback) {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const normalized = cleanProviderNames(raw || fallback).trim();
  if (!normalized) return fallback;

  if (/not configured|configuration|cookie password|required environment/iu.test(normalized)) {
    return "Qentrah sign-in is not ready in this build. Check the app configuration and try again.";
  }
  if (/invalid|incorrect|password|credentials|not found|no user|unknown user/iu.test(normalized)) {
    return "The email or password does not match a Qentrah account.";
  }
  if (/rate limit|too many|requests/iu.test(normalized)) {
    return "Too many attempts. Wait a minute, then try again.";
  }
  if (/reset|email/iu.test(normalized)) {
    return normalized;
  }
  return normalized;
}

function socialProviderLabel(provider?: "apple" | "google") {
  if (provider === "apple") return "Apple";
  if (provider === "google") return "Google";
  return "social";
}

export function socialAuthErrorMessage(
  error: unknown,
  fallback = "Unable to complete Qentrah sign in.",
  provider?: "apple" | "google",
) {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const normalized = cleanProviderNames(raw || fallback).trim();
  if (!normalized) return fallback;

  const providerLabel = socialProviderLabel(provider);
  if (/cancel/iu.test(normalized)) {
    return `${providerLabel} sign in was cancelled.`;
  }
  if (/not configured|configuration|provider.*not.*found|api key|client id|required environment/iu.test(normalized)) {
    return `${providerLabel} sign in is not ready in this build. Check the app configuration and try again.`;
  }
  if (/email or password|invalid|incorrect|credentials|not found|no user|unknown user/iu.test(normalized)) {
    return `${providerLabel} sign in could not finish. Try again.`;
  }
  if (/rate limit|too many|requests/iu.test(normalized)) {
    return "Too many attempts. Wait a minute, then try again.";
  }
  return normalized;
}

export function resetPasswordReason(error: unknown) {
  const message = authErrorMessage(error, "We could not send a reset email for that address.");
  if (/not match|not found|unknown user/iu.test(message)) {
    return "No Qentrah account was found for that email.";
  }
  return message;
}
