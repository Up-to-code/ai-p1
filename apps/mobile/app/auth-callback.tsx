/* eslint-disable max-lines */
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

import { authClient } from "@/auth/authClient";
import { authErrorMessage } from "@/auth/authErrors";
import { firstSearchParam } from "@/auth/authNavigation";
import { mobileAuthCallbackUrlWithQuery } from "@/auth/mobileAuthCallback";
import { useAuthSession } from "@/auth/useAuthSession";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    accessToken?: string;
    code?: string;
    email?: string;
    emailVerification?: string;
    error?: string;
    pendingAuthenticationToken?: string;
    refreshToken?: string;
    state?: string;
  }>();
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();

  useEffect(() => {
    const accessToken = firstSearchParam(params.accessToken);
    const code = firstSearchParam(params.code);
    const refreshToken = firstSearchParam(params.refreshToken);
    const error = firstSearchParam(params.error);
    const callbackState = firstSearchParam(params.state);
    const emailVerification = firstSearchParam(params.emailVerification);
    const email = firstSearchParam(params.email);
    const pendingAuthenticationToken = firstSearchParam(params.pendingAuthenticationToken);
    if (emailVerification === "1" && email && pendingAuthenticationToken) {
      router.replace({
        pathname: "/(auth)/login",
        params: {
          emailVerification: "1",
          email,
          pendingAuthenticationToken,
        },
      });
      return;
    }
    if (!accessToken && !code && !error) return;
    const query = new URLSearchParams();
    if (accessToken) query.set("accessToken", accessToken);
    if (code) query.set("code", code);
    if (refreshToken) query.set("refreshToken", refreshToken);
    if (error) query.set("error", error);
    if (callbackState) query.set("state", callbackState);
    void authClient.completeMobileCallback(mobileAuthCallbackUrlWithQuery(query)).catch((caught: unknown) => {
      const authError = caught as Error & {
        emailVerification?: {
          email: string;
          pendingAuthenticationToken: string;
        };
      };
      if (authError.emailVerification) {
        router.replace({
          pathname: "/(auth)/login",
          params: {
            emailVerification: "1",
            email: authError.emailVerification.email,
            pendingAuthenticationToken: authError.emailVerification.pendingAuthenticationToken,
          },
        });
        return;
      }
      Alert.alert("Sign in failed", authErrorMessage(caught, "Unable to complete Qentrah sign in."));
    });
  }, [
    params.accessToken,
    params.code,
    params.email,
    params.emailVerification,
    params.error,
    params.pendingAuthenticationToken,
    params.refreshToken,
    params.state,
    router,
  ]);

  if (!hydrationComplete || !isReady) {
    return <AppBootScreen />;
  }

  return <Redirect href={canAccessApp ? "/" : "/(auth)"} />;
}
