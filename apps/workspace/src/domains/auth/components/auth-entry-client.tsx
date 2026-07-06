"use client";

import { useLayoutEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { useHeadlessClerkAuth } from "../hooks/use-headless-clerk-auth";

const SAFE_CALLBACK_PATHS = new Set([
  "choose-org",
  "ws",
  "accept-invite",
  "onboarding",
  "dashboard",
  "projects",
  "tasks",
  "calendar",
  "clients",
  "docs",
  "inbox",
  "ai",
  "organization",
  "settings",
]);

function resolveTarget(callbackURL: string | null | undefined, locale: string): string {
  if (!callbackURL) return `/${locale}/choose-org`;

  if (
    callbackURL.startsWith("http://") ||
    callbackURL.startsWith("https://") ||
    callbackURL.startsWith("//") ||
    callbackURL.startsWith("javascript:") ||
    callbackURL.startsWith("data:")
  ) {
    return `/${locale}/ws`;
  }

  const localePrefix = new RegExp(`^/(${["en", "ar"].join("|")})/`);
  const normalized = callbackURL.replace(localePrefix, "/");

  try {
    const parsed = new URL(normalized, "https://qentrah.local");
    const segments = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
    const rootPath = segments[0] ?? "";

    if (SAFE_CALLBACK_PATHS.has(rootPath)) {
      return `/${locale}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return `/${locale}/ws`;
  }

  return `/${locale}/ws`;
}

type AuthEntryClientProps = {
  callbackURL?: string | null;
  locale: string;
  mode: "sign-in" | "sign-up";
};

export function AuthEntryClient({ callbackURL, locale, mode }: AuthEntryClientProps) {
  const clerkAuth = useAuth();
  const auth = useHeadlessClerkAuth({ callbackURL, locale, mode });

  useLayoutEffect(() => {
    if (clerkAuth.isLoaded && clerkAuth.isSignedIn) {
      const target = resolveTarget(callbackURL, locale);
      window.location.href = target;
    }
  }, [clerkAuth.isLoaded, clerkAuth.isSignedIn, callbackURL, locale]);

  if (!clerkAuth.isLoaded) {
    return <WorkspaceRouteLoading variant="session" />;
  }

  if (clerkAuth.isSignedIn) {
    return null;
  }

  return (
    <AuthAccessScreen
      error={auth.error}
      isPending={auth.isPending || !auth.isLoaded}
      mode={mode}
      onCredentialsSubmit={auth.submitCredentials}
      onSocialSignIn={auth.signInWithSocial}
      onVerifyCode={auth.verifyCode}
      onForgotPassword={auth.startForgotPassword}
      onVerifyResetCode={auth.verifyResetCode}
      onSubmitNewPassword={auth.submitNewPassword}
      onGoBack={auth.goBack}
      pendingProvider={auth.pendingProvider}
      phase={auth.phase}
    />
  );
}
