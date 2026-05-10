"use client";

import { useLocale } from "next-intl";

import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { createLocaleAuthCallbackUrl, useGoogleSignIn } from "@/domains/auth";

export default function SignUpPage() {
  const locale = useLocale();
  const googleSignIn = useGoogleSignIn({
    callbackURL: createLocaleAuthCallbackUrl(locale, "/choose-org"),
  });

  return (
    <AuthAccessScreen
      isPending={googleSignIn.isPending}
      mode="sign-up"
      onGoogleSignIn={googleSignIn.signIn}
    />
  );
}
