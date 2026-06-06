"use client";

import { useEffect } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
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
  const clerk = useClerk();
  const router = useRouter();
  const auth = useHeadlessClerkAuth({ callbackURL, locale, mode });
  const clerkState = clerk as unknown as {
    isSignedIn?: boolean;
    organization?: { id?: string | null } | null;
    session?: {
      currentTask?: unknown;
      lastActiveOrganizationId?: string | null;
    } | null;
    setActive?: (input: { organization: string }) => Promise<void>;
  };
  const session = clerkState.session ?? null;
  const organizationId = clerkAuth.orgId ?? clerkState.organization?.id ?? session?.lastActiveOrganizationId ?? null;
  const isSignedIn = Boolean(clerkAuth.isSignedIn || clerkState.isSignedIn || session);
  const hasActiveOrganization = Boolean(organizationId);

  useEffect(() => {
    if (!clerkAuth.isLoaded || !isSignedIn) return;

    let cancelled = false;
    const redirectSignedInUser = async () => {
      if (session?.currentTask) {
        router.replace("/choose-org");
        return;
      }

      if (organizationId && !clerkAuth.orgId) {
        await clerkState.setActive?.({ organization: organizationId });
      }

      if (!cancelled) router.replace(hasActiveOrganization ? "/dashboard" : "/choose-org");
    };

    void redirectSignedInUser();

    return () => {
      cancelled = true;
    };
  }, [clerkAuth.isLoaded, clerkAuth.orgId, clerkState, hasActiveOrganization, isSignedIn, organizationId, router, session]);

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
