export type EmailPasswordAuthError = {
  message?: string;
};

export function resolveBrowserCallbackUrl(path: string, origin?: string): string {
  const baseOrigin =
    origin
    ?? (typeof window === "undefined" ? undefined : window.location.origin);

  if (!baseOrigin) {
    return path;
  }

  try {
    return new URL(path, baseOrigin).toString();
  } catch {
    return path;
  }
}

export function getEmailPasswordErrorMessage(
  error: unknown,
  fallback = "Could not sign in. Check the email and password.",
  invalidMessage = fallback,
): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : null;

  if (message?.toLowerCase().includes("invalid")) {
    return invalidMessage;
  }

  return message ?? fallback;
}
