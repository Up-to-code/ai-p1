"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth, useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { resolveAuthEntryCallbackUrl } from "../utils/auth-callback-url";
import {
  assignExternalRedirect,
  clerkSocialProviderStrategies,
  externalVerificationRedirectUrl,
  isAlreadySignedInError,
  localizedAuthError,
  socialRedirectFallbackMs,
  toLocalizedPath,
  toRouterHref,
  type AuthErrorMessageKey,
  type ClerkSocialProvider,
} from "../lib/clerk-auth-utils";

type AuthMode = "sign-in" | "sign-up";
export type AuthFlowPhase = "credentials" | "verify_email" | "verify_second_factor";

type AuthFlowInput = {
  locale: string;
  mode: AuthMode;
  callbackURL?: string | null;
};

type CredentialsInput = {
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  password: string;
};

export type { ClerkSocialProvider };

export function useHeadlessClerkAuth({ locale, mode, callbackURL }: AuthFlowInput) {
  const t = useTranslations("signin.errors") as (key: AuthErrorMessageKey) => string;
  const router = useRouter();
  const clerk = useClerk();
  const clerkAuth = useAuth();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const [phase, setPhase] = useState<AuthFlowPhase>("credentials");
  const [isPending, setIsPending] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<ClerkSocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const signInLoaded = signInFetchStatus !== "fetching";
  const signUpLoaded = signUpFetchStatus !== "fetching";

  const finalCallbackURL = useMemo(() => resolveAuthEntryCallbackUrl(locale, callbackURL), [callbackURL, locale]);

  const redirectExistingSession = useCallback(async () => {
    const clerkState = clerk as unknown as {
      isSignedIn?: boolean;
      organization?: { id?: string | null } | null;
      session?: { currentTask?: unknown; lastActiveOrganizationId?: string | null } | null;
      setActive?: (input: { organization: string }) => Promise<void>;
    };
    const session = clerkState.session ?? null;
    const organizationId = clerkAuth.orgId ?? clerkState.organization?.id ?? session?.lastActiveOrganizationId ?? null;
    const isSignedIn = Boolean(clerkAuth.isSignedIn || clerkState.isSignedIn || session);

    if (!isSignedIn) return false;

    if (session?.currentTask || organizationId) {
      if (organizationId && !clerkAuth.orgId) {
        await clerkState.setActive?.({ organization: organizationId });
      }
      router.replace("/ws");
      return true;
    }

    router.replace("/ws");
    return true;
  }, [clerk, clerkAuth.isSignedIn, clerkAuth.orgId, router]);

  const navigateAfterAuth = useCallback(
    ({ session, decorateUrl }: { session?: { currentTask?: unknown } | null; decorateUrl: (url: string) => string }) => {
      if (session?.currentTask) {
        router.replace("/ws");
        return;
      }

      const url = decorateUrl(finalCallbackURL);
      if (url.startsWith("http")) {
        window.location.href = url;
        return;
      }

      router.replace(toRouterHref(locale, url));
    },
    [finalCallbackURL, locale, router],
  );

  const finalizeSignIn = useCallback(async () => {
    const api = signIn as unknown as {
      finalize?: (input: { navigate: typeof navigateAfterAuth }) => Promise<unknown>;
    };

    if (api.finalize) {
      await api.finalize({ navigate: navigateAfterAuth });
      return;
    }

    router.replace(toRouterHref(locale, finalCallbackURL));
  }, [finalCallbackURL, locale, navigateAfterAuth, router, signIn]);

  const finalizeSignUp = useCallback(async () => {
    const api = signUp as unknown as {
      finalize?: (input: { navigate: typeof navigateAfterAuth }) => Promise<unknown>;
    };

    if (api.finalize) {
      await api.finalize({ navigate: navigateAfterAuth });
      return;
    }

    router.replace(toRouterHref(locale, finalCallbackURL));
  }, [finalCallbackURL, locale, navigateAfterAuth, router, signUp]);

  const signInWithSocial = useCallback(
    async (provider: ClerkSocialProvider) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setError(null);
      setPendingProvider(provider);
      setIsPending(true);

      try {
        if (!signInLoaded || !signIn) throw new Error("Authentication is still loading.");

        const callback = `${toLocalizedPath(locale, "/sso-callback")}?callbackURL=${encodeURIComponent(finalCallbackURL)}`;
        const startUrl = window.location.href;
        const api = signIn as unknown as {
          authenticateWithRedirect?: (input: {
            strategy: `oauth_${string}`;
            redirectUrl: string;
            redirectUrlComplete: string;
          }) => Promise<unknown>;
          create?: (input: {
            actionCompleteRedirectUrl?: string;
            redirectUrl: string;
            strategy: `oauth_${string}`;
          }) => Promise<{
            error?: unknown;
            firstFactorVerification?: Parameters<typeof externalVerificationRedirectUrl>[0];
          } | undefined>;
          firstFactorVerification?: Parameters<typeof externalVerificationRedirectUrl>[0];
          sso?: (input: {
            strategy: `oauth_${string}`;
            redirectCallbackUrl: string;
            redirectUrl: string;
          }) => Promise<{ error?: unknown } | undefined>;
        };

        if (api.create) {
          const result = await api.create({
            actionCompleteRedirectUrl: finalCallbackURL,
            strategy: clerkSocialProviderStrategies[provider],
            redirectUrl: callback,
          });
          if (result?.error) throw result.error;

          const redirectUrl = externalVerificationRedirectUrl(result?.firstFactorVerification ?? api.firstFactorVerification);
          if (!redirectUrl) throw new Error("Social sign-in did not redirect.");
          assignExternalRedirect(redirectUrl);
          return;
        }

        if (api.authenticateWithRedirect) {
          await api.authenticateWithRedirect({
            strategy: clerkSocialProviderStrategies[provider],
            redirectUrl: callback,
            redirectUrlComplete: finalCallbackURL,
          });
          window.setTimeout(() => {
            if (window.location.href !== startUrl || !pendingRef.current) return;
            setError(t("socialStartFailed"));
            setIsPending(false);
            setPendingProvider(null);
            pendingRef.current = false;
          }, socialRedirectFallbackMs);
          return;
        }

        if (api.sso) {
          const result = await api.sso({
            strategy: clerkSocialProviderStrategies[provider],
            redirectCallbackUrl: callback,
            redirectUrl: finalCallbackURL,
          });
          if (result?.error) throw result.error;

          const redirectUrl = externalVerificationRedirectUrl(api.firstFactorVerification);
          if (!redirectUrl) throw new Error("Social sign-in did not redirect.");
          assignExternalRedirect(redirectUrl);
          return;
        }

        throw new Error("This Clerk SDK does not expose a social sign-in flow.");
      } catch (caught) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[Qentrah auth] social sign-in failed", caught);
        }
        setError(localizedAuthError(caught, t("socialStartFailed"), t));
        setIsPending(false);
        setPendingProvider(null);
        pendingRef.current = false;
      }
    },
    [finalCallbackURL, locale, signIn, signInLoaded, t],
  );

  const submitCredentials = useCallback(
    async ({ emailAddress, firstName, lastName, password }: CredentialsInput) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setError(null);
      setIsPending(true);

      try {
        if (mode === "sign-in" && (await redirectExistingSession())) return;

        if (mode === "sign-in") {
          if (!signInLoaded || !signIn) throw new Error("Authentication is still loading.");
          const api = signIn as unknown as {
            password?: (input: CredentialsInput) => Promise<{ error?: unknown } | undefined>;
            status?: string | null;
            mfa?: { sendEmailCode?: () => Promise<unknown> };
          };
          if (!api.password) throw new Error("Email/password sign-in is not enabled.");

          const result = await api.password({ emailAddress, password });
          if (result?.error) throw result.error;

          if (api.status === "complete") {
            await finalizeSignIn();
            return;
          }

          if (api.status === "needs_second_factor" || api.status === "needs_client_trust") {
            await api.mfa?.sendEmailCode?.();
            setPhase("verify_second_factor");
            return;
          }

          throw new Error("Sign-in requires an unsupported next step.");
        }

        if (!signUpLoaded || !signUp) throw new Error("Authentication is still loading.");
        const api = signUp as unknown as {
          password?: (input: CredentialsInput) => Promise<{ error?: unknown } | undefined>;
          status?: string | null;
          unverifiedFields?: string[];
          missingFields?: string[];
          verifications?: { sendEmailCode?: () => Promise<unknown> };
        };
        if (!api.password) throw new Error("Email/password sign-up is not enabled.");

        const result = await api.password({
          emailAddress,
          firstName: firstName?.trim() || undefined,
          lastName: lastName?.trim() || undefined,
          password,
        });
        if (result?.error) throw result.error;

        if (api.status === "complete") {
          await finalizeSignUp();
          return;
        }

        if (
          api.status === "missing_requirements" &&
          (api.unverifiedFields ?? []).includes("email_address") &&
          (api.missingFields ?? []).length === 0
        ) {
          await api.verifications?.sendEmailCode?.();
          setPhase("verify_email");
          return;
        }

        throw new Error("Sign-up requires an unsupported next step.");
      } catch (caught) {
        if (mode === "sign-in" && isAlreadySignedInError(caught) && (await redirectExistingSession())) return;
        setError(localizedAuthError(caught, mode === "sign-in" ? t("signInFailed") : t("signUpFailed"), t));
      } finally {
        setIsPending(false);
        pendingRef.current = false;
      }
    },
    [finalizeSignIn, finalizeSignUp, mode, redirectExistingSession, signIn, signInLoaded, signUp, signUpLoaded, t],
  );

  const verifyCode = useCallback(
    async (code: string) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setError(null);
      setIsPending(true);

      try {
        if (phase === "verify_email") {
          const api = signUp as unknown as {
            status?: string | null;
            verifications?: { verifyEmailCode?: (input: { code: string }) => Promise<{ error?: unknown } | undefined> };
          };
          const result = await api.verifications?.verifyEmailCode?.({ code });
          if (result?.error) throw result.error;
          if (api.status === "complete") {
            await finalizeSignUp();
            return;
          }
          throw new Error("Email verification is not complete.");
        }

        const api = signIn as unknown as {
          status?: string | null;
          mfa?: { verifyEmailCode?: (input: { code: string }) => Promise<{ error?: unknown } | undefined> };
        };
        const result = await api.mfa?.verifyEmailCode?.({ code });
        if (result?.error) throw result.error;
        if (api.status === "complete") {
          await finalizeSignIn();
          return;
        }
        throw new Error("Verification is not complete.");
      } catch (caught) {
        setError(localizedAuthError(caught, t("verifyFailed"), t));
      } finally {
        setIsPending(false);
        pendingRef.current = false;
      }
    },
    [finalizeSignIn, finalizeSignUp, phase, signIn, signUp, t],
  );

  const finalizeCallback = useCallback(async () => {
    if (!clerk.loaded || !signInLoaded || !signUpLoaded || pendingRef.current) return;
    pendingRef.current = true;

    try {
      const signInApi = signIn as unknown as {
        status?: string | null;
        isTransferable?: boolean;
        existingSession?: { sessionId?: string };
        create?: (input: { transfer: true }) => Promise<unknown>;
      };
      const signUpApi = signUp as unknown as {
        status?: string | null;
        isTransferable?: boolean;
        existingSession?: { sessionId?: string };
        create?: (input: { transfer: true }) => Promise<unknown>;
      };

      if (signInApi.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (signUpApi.isTransferable) {
        await signInApi.create?.({ transfer: true });
        if (signInApi.status === "complete") {
          await finalizeSignIn();
          return;
        }
      }

      if (signInApi.isTransferable) {
        await signUpApi.create?.({ transfer: true });
        if (signUpApi.status === "complete") {
          await finalizeSignUp();
          return;
        }
      }

      if (signUpApi.status === "complete") {
        await finalizeSignUp();
        return;
      }

      const sessionId = signInApi.existingSession?.sessionId ?? signUpApi.existingSession?.sessionId;
      if (sessionId) {
        await clerk.setActive({ session: sessionId, navigate: navigateAfterAuth });
        return;
      }

      router.replace(`/sign-in?callbackURL=${encodeURIComponent(finalCallbackURL)}`);
    } catch (caught) {
      setError(localizedAuthError(caught, t("callbackFailed"), t));
      router.replace(`/sign-in?callbackURL=${encodeURIComponent(finalCallbackURL)}`);
    } finally {
      pendingRef.current = false;
    }
  }, [
    clerk,
    finalCallbackURL,
    finalizeSignIn,
    finalizeSignUp,
    navigateAfterAuth,
    router,
    signIn,
    signInLoaded,
    signUp,
    signUpLoaded,
    t,
  ]);

  return {
    error,
    finalCallbackURL,
    finalizeCallback,
    isLoaded: signInLoaded && signUpLoaded,
    isPending,
    pendingProvider,
    phase,
    signInWithSocial,
    submitCredentials,
    verifyCode,
  };
}
