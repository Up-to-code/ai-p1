"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "@/i18n/routing";
import { resolveAuthEntryCallbackUrl } from "../utils/auth-callback-url";

type AuthMode = "sign-in" | "sign-up";
export type ClerkSocialProvider = "google" | "apple";
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

const providerStrategies: Record<ClerkSocialProvider, `oauth_${string}`> = {
  apple: "oauth_apple",
  google: "oauth_google",
};

function authErrorMessage(error: unknown, fallback: string) {
  const candidate = error as {
    message?: string;
    errors?: Array<{ message?: string; longMessage?: string; code?: string }>;
  };
  const first = candidate?.errors?.[0];
  return first?.longMessage ?? first?.message ?? first?.code ?? candidate?.message ?? fallback;
}

function toLocalizedPath(locale: string, path: string) {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

function toRouterHref(locale: string, url: string) {
  const localePrefix = `/${locale}`;
  if (url === localePrefix) return "/";
  if (url.startsWith(`${localePrefix}/`)) return url.slice(localePrefix.length);
  return url;
}

export function useHeadlessClerkAuth({ locale, mode, callbackURL }: AuthFlowInput) {
  const router = useRouter();
  const clerk = useClerk();
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

  const navigateAfterAuth = useCallback(
    ({ session, decorateUrl }: { session?: { currentTask?: unknown } | null; decorateUrl: (url: string) => string }) => {
      if (session?.currentTask) {
        router.replace("/choose-org");
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
      status?: string | null;
    };

    if (api.finalize) {
      await api.finalize({ navigate: navigateAfterAuth });
      return;
    }

    router.replace(toRouterHref(locale, finalCallbackURL));
  }, [finalCallbackURL, navigateAfterAuth, router, signIn]);

  const finalizeSignUp = useCallback(async () => {
    const api = signUp as unknown as {
      finalize?: (input: { navigate: typeof navigateAfterAuth }) => Promise<unknown>;
      status?: string | null;
    };

    if (api.finalize) {
      await api.finalize({ navigate: navigateAfterAuth });
      return;
    }

    router.replace(toRouterHref(locale, finalCallbackURL));
  }, [finalCallbackURL, navigateAfterAuth, router, signUp]);

  const signInWithSocial = useCallback(
    async (provider: ClerkSocialProvider) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setError(null);
      setPendingProvider(provider);
      setIsPending(true);

      try {
        if (!signInLoaded || !signIn) {
          throw new Error("Authentication is still loading.");
        }

        const callback = `${toLocalizedPath(locale, "/sso-callback")}?callbackURL=${encodeURIComponent(finalCallbackURL)}`;
        const api = signIn as unknown as {
          sso?: (input: {
            strategy: `oauth_${string}`;
            redirectCallbackUrl: string;
            redirectUrl: string;
          }) => Promise<{ error?: unknown } | undefined>;
          authenticateWithRedirect?: (input: {
            strategy: `oauth_${string}`;
            redirectUrl: string;
            redirectUrlComplete: string;
          }) => Promise<unknown>;
        };

        if (api.sso) {
          const result = await api.sso({
            strategy: providerStrategies[provider],
            redirectCallbackUrl: callback,
            redirectUrl: callback,
          });
          if (result?.error) throw result.error;
          return;
        }

        if (api.authenticateWithRedirect) {
          await api.authenticateWithRedirect({
            strategy: providerStrategies[provider],
            redirectUrl: callback,
            redirectUrlComplete: finalCallbackURL,
          });
          return;
        }

        throw new Error("This Clerk SDK does not expose a social sign-in flow.");
      } catch (caught) {
        setError(authErrorMessage(caught, "Could not start social sign-in."));
        setIsPending(false);
        setPendingProvider(null);
        pendingRef.current = false;
      }
    },
    [finalCallbackURL, locale, signIn, signInLoaded],
  );

  const submitCredentials = useCallback(
    async ({ emailAddress, firstName, lastName, password }: CredentialsInput) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setError(null);
      setIsPending(true);

      try {
        if (mode === "sign-in") {
          if (!signInLoaded || !signIn) throw new Error("Authentication is still loading.");
          const api = signIn as unknown as {
            password?: (input: CredentialsInput) => Promise<{ error?: unknown } | undefined>;
            status?: string | null;
            supportedSecondFactors?: Array<{ strategy?: string }>;
            mfa?: {
              sendEmailCode?: () => Promise<unknown>;
            };
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
          verifications?: {
            sendEmailCode?: () => Promise<unknown>;
          };
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
        setError(authErrorMessage(caught, mode === "sign-in" ? "Could not sign in." : "Could not create account."));
      } finally {
        setIsPending(false);
        pendingRef.current = false;
      }
    },
    [finalizeSignIn, finalizeSignUp, mode, signIn, signInLoaded, signUp, signUpLoaded],
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
            verifications?: {
              verifyEmailCode?: (input: { code: string }) => Promise<{ error?: unknown } | undefined>;
            };
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
          mfa?: {
            verifyEmailCode?: (input: { code: string }) => Promise<{ error?: unknown } | undefined>;
          };
        };
        const result = await api.mfa?.verifyEmailCode?.({ code });
        if (result?.error) throw result.error;
        if (api.status === "complete") {
          await finalizeSignIn();
          return;
        }
        throw new Error("Verification is not complete.");
      } catch (caught) {
        setError(authErrorMessage(caught, "Could not verify this code."));
      } finally {
        setIsPending(false);
        pendingRef.current = false;
      }
    },
    [finalizeSignIn, finalizeSignUp, phase, signIn, signUp],
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
        await clerk.setActive({
          session: sessionId,
          navigate: navigateAfterAuth,
        });
        return;
      }

      router.replace(`/sign-in?callbackURL=${encodeURIComponent(finalCallbackURL)}`);
    } catch (caught) {
      setError(authErrorMessage(caught, "Could not complete sign-in."));
      router.replace(`/sign-in?callbackURL=${encodeURIComponent(finalCallbackURL)}`);
    } finally {
      pendingRef.current = false;
    }
  }, [
    clerk,
    finalCallbackURL,
    finalizeSignIn,
    finalizeSignUp,
    locale,
    navigateAfterAuth,
    router,
    signIn,
    signInLoaded,
    signUp,
    signUpLoaded,
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
