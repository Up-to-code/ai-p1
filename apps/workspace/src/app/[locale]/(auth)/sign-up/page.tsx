"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { resolveAuthEntryCallbackUrl, useGoogleSignIn } from "@/domains/auth";

export default function SignUpPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const requestedCallback = searchParams.get("callbackURL");
  const callbackURL = resolveAuthEntryCallbackUrl(locale, requestedCallback);
  const googleSignIn = useGoogleSignIn({
    callbackURL,
  });

  return (
    <AuthAccessScreen
      isPending={googleSignIn.isPending}
      mode="sign-up"
      onGoogleSignIn={googleSignIn.signIn}
    />
  );
}
