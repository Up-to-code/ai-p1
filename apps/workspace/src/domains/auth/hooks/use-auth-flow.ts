"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";

export type AuthFlowPhase = "initial" | "credentials" | "sso" | "mfa" | "complete" | "forgot-password" | "reset-code" | "new-password";
export type SocialProvider = "google" | "apple";

interface UseAuthFlowOptions {
  callbackURL?: string | null;
  locale: string;
  mode: "sign-in" | "sign-up";
}

interface UseAuthFlowResult {
  phase: AuthFlowPhase;
  isPending: boolean;
  error?: string | null;
  pendingProvider?: SocialProvider | null;
  finalizeCallback: () => Promise<void>;
  submitCredentials: (input: { emailAddress: string; name?: string; password: string }) => Promise<void>;
  signInWithSocial: (provider: SocialProvider) => Promise<void>;
  startForgotPassword: (emailAddress: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<void>;
  submitNewPassword: (password: string) => Promise<void>;
  goBack: () => void;
}

type OAuthContinueResult = {
  data?: { redirect?: boolean; url?: string } | null;
  error?: { message?: string; code?: string } | null;
};

function oauthAuthorizationQuery() {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.has("client_id") && params.has("sig") ? params.toString() : undefined;
}

export function useAuthFlow(
  options: UseAuthFlowOptions
): UseAuthFlowResult {
  const router = useRouter();

  const [phase, setPhase] = useState<AuthFlowPhase>("initial");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [resetEmailAddress, setResetEmailAddress] = useState("");
  const [resetVerificationCode, setResetVerificationCode] = useState("");

  const finalizeCallback = async () => {
    const oauthQuery = oauthAuthorizationQuery();
    if (oauthQuery) {
      const result = await (authClient as typeof authClient & {
        oauth2: {
          continue: (input: { postLogin: true; oauth_query: string }) => Promise<OAuthContinueResult>;
        };
      }).oauth2.continue({ postLogin: true, oauth_query: oauthQuery });
      if (result.error || !result.data?.url) {
        throw new Error(result.error?.message ?? result.error?.code ?? "Could not continue MCP authorization.");
      }
      window.location.assign(result.data.url);
      return;
    }

    if (options.callbackURL) {
      const localePrefixPattern = new RegExp(`^/(${["en", "ar"].join("|")})/`);
      const cleanPath = options.callbackURL.replace(localePrefixPattern, "/");
      router.push(cleanPath);
    } else {
      router.push("/choose-org");
    }
  };

  const submitCredentials = async (input: { emailAddress: string; name?: string; password: string }) => {
    setIsPending(true);
    setError(null);
    setPhase("credentials");

    try {
      if (options.mode === "sign-up") {
        const { error: signUpError } = await authClient.signUp.email({
          email: input.emailAddress,
          password: input.password,
          name: input.name ?? input.emailAddress,
          callbackURL: options.callbackURL ?? undefined,
        });
        if (signUpError) throw signUpError;
        await finalizeCallback();
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: input.emailAddress,
          password: input.password,
          callbackURL: options.callbackURL ?? undefined,
        });
        if (signInError) throw signInError;
        await finalizeCallback();
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setIsPending(false);
    }
  };

  const signInWithSocial = async (provider: SocialProvider) => {
    setIsPending(true);
    setError(null);
    setPendingProvider(provider);
    setPhase("sso");

    try {
      const oauthQuery = oauthAuthorizationQuery();
      const { error: ssoErr } = await authClient.signIn.social({
        provider,
        callbackURL: oauthQuery
          ? `/oauth/select-organization?${oauthQuery}`
          : options.callbackURL ?? undefined,
      });
      if (ssoErr) throw ssoErr;
    } catch (err: any) {
      setError(err?.message || "Social authentication failed");
      setPendingProvider(null);
    } finally {
      setIsPending(false);
    }
  };

  const startForgotPassword = async (emailAddress: string) => {
    if (!emailAddress) {
      setPhase("forgot-password");
      setError(null);
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const email = emailAddress.trim().toLowerCase();
      const { error: forgotErr } = await (authClient as any).emailOtp.requestPasswordReset({ email });
      if (forgotErr) throw forgotErr;
      setResetEmailAddress(email);
      setResetVerificationCode("");
      setPhase("reset-code");
    } catch (err: any) {
      setPhase("forgot-password");
      setError(err?.message || "Failed to send reset email");
    } finally {
      setIsPending(false);
    }
  };

  const verifyResetCode = async (code: string) => {
    const trimmedCode = code.trim();
    if (!resetEmailAddress || !trimmedCode) {
      setPhase("reset-code");
      setError("Enter the verification code sent to your email.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const emailOtpClient = (authClient as any).emailOtp;
      const checkVerificationOtp = emailOtpClient.checkVerificationOTP ?? emailOtpClient.checkVerificationOtp;
      const { error: checkErr } = checkVerificationOtp
        ? await checkVerificationOtp({
          email: resetEmailAddress,
          otp: trimmedCode,
          type: "forget-password",
        })
        : await (authClient as any).$fetch("/email-otp/check-verification-otp", {
          method: "POST",
          body: {
            email: resetEmailAddress,
            otp: trimmedCode,
            type: "forget-password",
          },
        });
      if (checkErr) throw checkErr;
      setResetVerificationCode(trimmedCode);
      setPhase("new-password");
    } catch (err: any) {
      setPhase("reset-code");
      setError(err?.message || "Invalid or expired verification code");
    } finally {
      setIsPending(false);
    }
  };

  const submitNewPassword = async (password: string) => {
    if (!resetEmailAddress || !resetVerificationCode) {
      setPhase(resetEmailAddress ? "reset-code" : "forgot-password");
      setError("Verify the reset code before setting a new password.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const { error: resetErr } = await (authClient as any).emailOtp.resetPassword({
        email: resetEmailAddress,
        otp: resetVerificationCode,
        password,
      });
      if (resetErr) throw resetErr;

      const { error: signInError } = await authClient.signIn.email({
        email: resetEmailAddress,
        password,
        callbackURL: options.callbackURL ?? undefined,
      });
      if (signInError) throw signInError;
      await finalizeCallback();
    } catch (err: any) {
      setPhase("new-password");
      setError(err?.message || "Failed to reset password");
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
    error,
    pendingProvider,
    finalizeCallback,
    submitCredentials,
    signInWithSocial,
    startForgotPassword,
    verifyResetCode,
    submitNewPassword,
    goBack,
  };
}
