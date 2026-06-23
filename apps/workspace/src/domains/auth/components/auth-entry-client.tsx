"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { useHeadlessClerkAuth } from "../hooks/use-headless-clerk-auth";

type AuthEntryClientProps = {
  callbackURL?: string | null;
  locale: string;
  mode: "sign-in" | "sign-up";
};

export function AuthEntryClient({ callbackURL, locale, mode }: AuthEntryClientProps) {
  const clerkAuth = useAuth();
  const clerk = useClerk();
  const auth = useHeadlessClerkAuth({ callbackURL, locale, mode });
  const clerkState = clerk as unknown as {
    session?: {
      currentTask?: unknown;
    } | null;
  };
  const session = clerkState.session ?? null;
  const isSignedIn = Boolean(clerkAuth.isSignedIn || session);

  // Show loading while Clerk initializes or while the user is already
  // signed in and waiting for the server-side redirect from
  // redirectAuthenticatedUserFromAuthEntry / the middleware.
  if (!clerkAuth.isLoaded || isSignedIn) {
    return <WorkspaceRouteLoading variant="session" />;
  }

  return (
    <AuthAccessScreen
      error={auth.error}
      isPending={auth.isPending || !auth.isLoaded}
      mode={mode}
      onCredentialsSubmit={auth.submitCredentials}
      onSocialSignIn={auth.signInWithSocial}
      onVerifyCode={auth.verifyCode}
      pendingProvider={auth.pendingProvider}
      phase={auth.phase}
    />
  );
}
