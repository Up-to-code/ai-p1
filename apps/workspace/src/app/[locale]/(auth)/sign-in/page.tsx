"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { createLocaleAuthCallbackUrl, useGoogleSignIn } from "@/domains/auth";

export default function SignInPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const requestedCallback = searchParams.get("callbackURL");
  const callbackURL = requestedCallback?.startsWith(`/${locale}/`)
    ? requestedCallback
    : createLocaleAuthCallbackUrl(locale, "/choose-org");
  const googleSignIn = useGoogleSignIn({
    callbackURL,
  });

  return (
    <AuthAccessScreen
      isPending={googleSignIn.isPending}
      mode="sign-in"
      onGoogleSignIn={googleSignIn.signIn}
    />
  );
}
