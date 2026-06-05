"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { useRouter } from "@/i18n/routing";
import { useHeadlessClerkAuth } from "../hooks/use-headless-clerk-auth";

type AuthEntryClientProps = {
  callbackURL?: string | null;
  locale: string;
  mode: "sign-in" | "sign-up";
};

export function AuthEntryClient({ callbackURL, locale, mode }: AuthEntryClientProps) {
  const clerkAuth = useAuth();
  const router = useRouter();
  const auth = useHeadlessClerkAuth({ callbackURL, locale, mode });
  const isSignedIn = Boolean(clerkAuth.isSignedIn);
  const hasActiveOrganization = Boolean(clerkAuth.orgId);

  useEffect(() => {
    if (!clerkAuth.isLoaded || !isSignedIn) return;
    router.replace(hasActiveOrganization ? "/dashboard" : "/choose-org");
  }, [clerkAuth.isLoaded, hasActiveOrganization, isSignedIn, router]);

  if (!clerkAuth.isLoaded || isSignedIn) {
    return <WorkspaceRouteLoading variant="auth" />;
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
