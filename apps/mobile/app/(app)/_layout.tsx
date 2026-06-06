import { Redirect, Stack } from "expo-router";
import { useMemo } from "react";

import { useMobileAuthGate } from "@/auth/mobileAuthGate";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";

export default function AppLayout() {
  const gate = useMobileAuthGate();
  const { colors } = useTheme();
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      contentStyle: {
        backgroundColor: colors.background,
      },
      animation: "fade" as const,
      animationDuration: 120,
    }),
    [colors.background],
  );

  if (!gate.isReady || !gate.destination) {
    return <AppBootScreen />;
  }

  if (gate.status !== "ready") {
    return <Redirect href={gate.destination} />;
  }

  return (
    <Stack
      screenOptions={screenOptions}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="organization" />
      <Stack.Screen name="threads" />
      <Stack.Screen name="language" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
