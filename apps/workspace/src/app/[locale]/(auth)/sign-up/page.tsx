"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthAccessScreen } from "@/components/auth/auth-access-screen";
import { createLocaleAuthCallbackUrl } from "@/domains/auth";

export default function SignUpPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const requestedCallback = searchParams.get("callbackURL");
  const callbackURL = requestedCallback?.startsWith(`/${locale}/`)
    ? requestedCallback
    : createLocaleAuthCallbackUrl(locale, "/dashboard");

  function startWorkOSSignUp() {
    if (isPending) return;
    setIsPending(true);
    const params = new URLSearchParams({
      returnTo: callbackURL,
    });
    window.location.assign(`/sign-up?${params.toString()}`);
  }

  return (
    <AuthAccessScreen
      isPending={isPending}
      mode="sign-up"
      onAuthStart={startWorkOSSignUp}
    />
  );
}
