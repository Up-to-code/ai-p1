"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "@/i18n/routing";

export type AuthFlowPhase = "initial" | "credentials" | "sso" | "mfa" | "complete";
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
  submitCredentials: (input: { emailAddress: string; firstName?: string; lastName?: string; password: string }) => void;
  signInWithSocial: (provider: ClerkSocialProvider) => void;
  verifyCode: (code: string) => void;
}

export function useHeadlessClerkAuth(
  options: UseHeadlessClerkAuthOptions
): UseHeadlessClerkAuthResult {
  const signIn = useSignIn();
  const signUp = useSignUp();
  const router = useRouter();

  const finalizeCallback = async () => {
    // Clerk handles callback finalization automatically
    // Just redirect to the target URL
    if (options.callbackURL) {
      router.push(options.callbackURL);
    } else {
      router.push(`/${options.locale}/ws`);
    }
  };

  const submitCredentials = (input: { emailAddress: string; firstName?: string; lastName?: string; password: string }) => {
    // Clerk handles credentials submission through their built-in components
    // This is a placeholder for custom auth flow if needed
    console.log('Credentials submission:', options.mode, input.emailAddress);
  };

  const signInWithSocial = (provider: ClerkSocialProvider) => {
    // Clerk handles social sign-in through their built-in components
    // This is a placeholder for custom auth flow if needed
    console.log('Social sign-in:', provider);
  };

  const verifyCode = (code: string) => {
    // Clerk handles code verification
    // This is a placeholder - actual implementation depends on Clerk's API
  };

  return {
    phase: "initial",
    isPending: !signIn || !signUp,
    isLoaded: !!signIn && !!signUp,
    error: null,
    pendingProvider: null,
    finalizeCallback,
    submitCredentials,
    signInWithSocial,
    verifyCode,
  };
}
