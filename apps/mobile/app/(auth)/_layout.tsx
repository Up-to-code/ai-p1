import { Redirect, Stack, useSegments } from "expo-router";
import { useMemo } from "react";

import { useMobileAuthGate } from "@/auth/mobileAuthGate";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";

export default function AuthLayout() {
  const gate = useMobileAuthGate();
  const { colors } = useTheme();
  const segments = useSegments();
  const authRoute = segments[1];
  const canStayInAuth =
    authRoute === "accept-invite" ||
    (authRoute === "choose-workspace" && gate.destination === "/(auth)/choose-workspace");
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      contentStyle: {
        backgroundColor: colors.background,
      },
      animation: "none" as const,
    }),
    [colors.background],
  );

  if (!gate.isReady || !gate.destination) {
    return <AppBootScreen />;
  }

  if (gate.status === "signed_out" && authRoute && authRoute !== "accept-invite") {
    return <Redirect href="/(auth)" />;
  }

  if (gate.isAuthenticated && !canStayInAuth) {
    return <Redirect href={gate.destination} />;
  }

  return (
    <Stack
      screenOptions={screenOptions}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="choose-workspace" />
      <Stack.Screen name="accept-invite" />
    </Stack>
  );
}
