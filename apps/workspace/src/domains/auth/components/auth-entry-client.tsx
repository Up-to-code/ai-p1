"use client";

import { useLayoutEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { useAuthFlow } from "../hooks/use-auth-flow";
import { resolveAuthEntryCallbackUrl } from "../utils/auth-callback-url";

type Props = {
  locale: string;
  mode: "sign-in" | "sign-up";
  callbackURL?: string | null;
};

export function AuthEntryClient({ locale, mode, callbackURL }: Props) {
  const { data: session, isPending } = authClient.useSession();
  const targetCallbackURL = callbackURL
    ? resolveAuthEntryCallbackUrl(locale, callbackURL, "/choose-org")
    : `/${locale}/choose-org`;
  const auth = useAuthFlow({
    callbackURL: targetCallbackURL,
    locale,
    mode,
  });

  useLayoutEffect(() => {
    if (!isPending && session?.user && callbackURL) {
      window.location.href = targetCallbackURL;
    }
  }, [isPending, session, callbackURL, targetCallbackURL]);

  if (isPending) {
    return <WorkspaceRouteLoading variant="auth" authMode={mode} />;
  }

  if (session?.user) {
    return <WorkspaceRouteLoading variant="auth" authMode={mode} />;
  }

  return (
    <AuthAccessScreen
      error={auth.error}
      isPending={auth.isPending}
      mode={mode}
      onCredentialsSubmit={(input) => void auth.submitCredentials({
        emailAddress: input.emailAddress,
        password: input.password,
        name: [input.firstName, input.lastName].filter(Boolean).join(" ").trim() || undefined,
      })}
      onSocialSignIn={(provider) => void auth.signInWithSocial(provider as any)}
      onVerifyCode={() => {}}
      onForgotPassword={(email) => void auth.startForgotPassword(email)}
      onVerifyResetCode={(code) => void auth.verifyResetCode(code)}
      onSubmitNewPassword={(password) => void auth.submitNewPassword(password)}
      onGoBack={() => auth.goBack()}
      pendingProvider={auth.pendingProvider}
      phase={auth.phase}
    />
  );
}
