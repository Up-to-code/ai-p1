"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "@/i18n/routing";

export type AuthFlowPhase = "initial" | "credentials" | "sso" | "mfa" | "complete" | "forgot-password" | "reset-code" | "new-password";
export type ClerkSocialProvider = "google" | "github" | "microsoft" | "apple";

interface UseHeadlessClerkAuthOptions {
  callbackURL?: string | null;
  locale: string;
  mode: "sign-in" | "sign-up";
}

interface UseHeadlessClerkAuthResult {
  phase: AuthFlowPhase;
  isPending: boolean;
  isLoaded: boolean;
  error?: string | null;
  pendingProvider?: ClerkSocialProvider | null;
  finalizeCallback: () => Promise<void>;
  submitCredentials: (input: { emailAddress: string; firstName?: string; lastName?: string; password: string }) => Promise<void>;
  signInWithSocial: (provider: ClerkSocialProvider) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  startForgotPassword: (emailAddress: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<void>;
  submitNewPassword: (password: string) => Promise<void>;
  goBack: () => void;
}

export function useHeadlessClerkAuth(
  options: UseHeadlessClerkAuthOptions
): UseHeadlessClerkAuthResult {
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const router = useRouter();

  const [phase, setPhase] = useState<AuthFlowPhase>("initial");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<ClerkSocialProvider | null>(null);

  const finalizeCallback = async () => {
    if (options.callbackURL) {
      // callbackURL may already be locale-prefixed (e.g. "/en/choose-org").
      // next-intl's router.push adds the locale automatically, so strip it first.
      const localePrefixPattern = new RegExp(`^/(${["en", "ar"].join("|")})/`);
      const cleanPath = options.callbackURL.replace(localePrefixPattern, "/");
      router.push(cleanPath);
    } else {
      // Default to organization selection page after auth
      // The choose-org page will redirect to /ws if user already has an org
      router.push("/choose-org");
    }
  };

  const submitCredentials = async (input: { emailAddress: string; firstName?: string; lastName?: string; password: string }) => {
    setIsPending(true);
    setError(null);
    setPhase("credentials");

    try {
      if (options.mode === "sign-up") {
        const { error } = await signUp.create({
          emailAddress: input.emailAddress,
          password: input.password,
          firstName: input.firstName,
          lastName: input.lastName,
        });
        if (error) throw error;

        if (signUp.status === "missing_requirements") {
          setPhase("mfa");
        } else {
          if (signUp.status === "complete") {
            const { error: finalizeErr } = await signUp.finalize();
            if (finalizeErr) throw finalizeErr;
          }
          await finalizeCallback();
        }
      } else {
        const { error } = await signIn.create({
          identifier: input.emailAddress,
          password: input.password,
        });
        if (error) throw error;

        if (signIn.status === "needs_first_factor" || signIn.status === "needs_second_factor") {
          setPhase("mfa");
        } else {
          if (signIn.status === "complete") {
            const { error: finalizeErr } = await signIn.finalize();
            if (finalizeErr) throw finalizeErr;
          }
          await finalizeCallback();
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Authentication failed");
    } finally {
      setIsPending(false);
    }
  };

  const signInWithSocial = async (provider: ClerkSocialProvider) => {
    setIsPending(true);
    setError(null);
    setPendingProvider(provider);
    setPhase("sso");

    try {
      const strategy = `oauth_${provider}` as const;
      const origin = window.location.origin;
      const redirectUrl = `${origin}/${options.locale}/sso-callback`;
      const redirectUrlComplete = options.callbackURL
        ? `${origin}${options.callbackURL}`
        : `${origin}/${options.locale}/ws`;

      if (options.mode === "sign-up") {
        const { error: ssoErr } = await signUp.sso({
          strategy,
          redirectUrl,
          redirectCallbackUrl: redirectUrlComplete,
        });
        if (ssoErr) throw ssoErr;
      } else {
        const { error: ssoErr } = await signIn.sso({
          strategy,
          redirectUrl,
          redirectCallbackUrl: redirectUrlComplete,
        });
        if (ssoErr) throw ssoErr;
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Social authentication failed");
      setPendingProvider(null);
    } finally {
      setIsPending(false);
    }
  };

  const verifyCode = async (code: string) => {
    setIsPending(true);
    setError(null);

    try {
      if (options.mode === "sign-up") {
        const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code });
        if (verifyErr) throw verifyErr;

        if (signUp.status === "complete") {
          const { error: finalizeErr } = await signUp.finalize();
          if (finalizeErr) throw finalizeErr;
          setPhase("complete");
          await finalizeCallback();
        }
      } else {
        const { error: verifyErr } = await signIn.emailCode.verifyCode({ code });
        if (verifyErr) throw verifyErr;

        if (signIn.status === "complete") {
          const { error: finalizeErr } = await signIn.finalize();
          if (finalizeErr) throw finalizeErr;
          setPhase("complete");
          await finalizeCallback();
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Code verification failed");
    } finally {
      setIsPending(false);
    }
  };

  const startForgotPassword = async (emailAddress: string) => {
    // If no email yet, just show the forgot-password email entry form
    if (!emailAddress) {
      setPhase("forgot-password");
      setError(null);
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      // Start a sign-in with just the identifier so Clerk knows the account
      const { error: createErr } = await signIn.create({ identifier: emailAddress });
      if (createErr) throw createErr;

      // Send the reset code to their email
      const { error: sendErr } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendErr) throw sendErr;

      setPhase("reset-code");
    } catch (err: any) {
      setPhase("forgot-password");
      setError(err.errors?.[0]?.message || err.message || "Failed to send reset email");
    } finally {
      setIsPending(false);
    }
  };

  const verifyResetCode = async (code: string) => {
    setIsPending(true);
    setError(null);

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (error) throw error;
      // After verifyCode succeeds, signIn.status becomes "needs_new_password"
      setPhase("new-password");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Invalid reset code");
    } finally {
      setIsPending(false);
    }
  };

  const submitNewPassword = async (password: string) => {
    setIsPending(true);
    setError(null);

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (error) throw error;

      if (signIn.status === "complete") {
        const { error: finalizeErr } = await signIn.finalize();
        if (finalizeErr) throw finalizeErr;
      }
      setPhase("complete");
      await finalizeCallback();
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Failed to set new password");
    } finally {
      setIsPending(false);
    }
  };

  const goBack = () => {
    setPhase("initial");
    setError(null);
  };

  return {
    phase,
    isPending,
    isLoaded: signInFetchStatus === "idle" && signUpFetchStatus === "idle",
    error,
    pendingProvider,
    finalizeCallback,
    submitCredentials,
    signInWithSocial,
    verifyCode,
    startForgotPassword,
    verifyResetCode,
    submitNewPassword,
    goBack,
  };
}
