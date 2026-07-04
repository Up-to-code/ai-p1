"use client";

import { useLayoutEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { useHeadlessClerkAuth } from "../hooks/use-headless-clerk-auth";

function resolveTarget(callbackURL: string | null | undefined, locale: string): string {
  if (!callbackURL) return `/${locale}/choose-org`;

  // callbackURL may be locale-prefixed (e.g. "/en/choose-org") or bare.
  if (callbackURL.startsWith("/")) return callbackURL;

  return `/${locale}/${callbackURL}`;
}

type AuthEntryClientProps = {
  callbackURL?: string | null;
  locale: string;
  mode: "sign-in" | "sign-up";
};

export function AuthEntryClient({ callbackURL, locale, mode }: AuthEntryClientProps) {
  const clerkAuth = useAuth();
  const auth = useHeadlessClerkAuth({ callbackURL, locale, mode });

  // If Clerk detects the user is already signed in (but the server-side
  // redirectAuthenticatedUserFromAuthEntry missed it — e.g., cookie not
  // propagated), redirect client-side so we never show an infinite loading
  // state waiting for a server redirect that will never come.
  // Respect callbackURL if present (e.g. /choose-org).
  // useLayoutEffect fires synchronously before paint — no flash.
  // window.location.href forces an immediate hard navigation — no router delay.
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
