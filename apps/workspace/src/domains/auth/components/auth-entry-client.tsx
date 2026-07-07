"use client";

import { useLayoutEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { WorkspaceRouteLoading } from "@/components/loading/workspace-route-loading";
import { useAuthFlow } from "../hooks/use-auth-flow";

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
  }

  return `/${locale}/ws`;
}

type Props = {
  locale: string;
  mode: "sign-in" | "sign-up";
  callbackURL?: string | null;
};

export function AuthEntryClient({ locale, mode, callbackURL }: Props) {
  const { data: session, isPending } = authClient.useSession();
  const auth = useAuthFlow({
    callbackURL: resolveTarget(callbackURL, locale),
    locale,
    mode,
  });

  useLayoutEffect(() => {
    if (!isPending && session?.user && callbackURL) {
      window.location.href = resolveTarget(callbackURL, locale);
    }
  }, [isPending, session, callbackURL, locale]);

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
      onCredentialsSubmit={(input) => void auth.submitCredentials(input)}
      onSocialSignIn={(provider) => void auth.signInWithSocial(provider as any)}
      onVerifyCode={() => {}}
      onForgotPassword={(email) => void auth.startForgotPassword(email)}
      onVerifyResetCode={() => {}}
      onSubmitNewPassword={() => {}}
      onGoBack={() => auth.goBack()}
      pendingProvider={auth.pendingProvider}
      phase={auth.phase}
    />
  );
}
