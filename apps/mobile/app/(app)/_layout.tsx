import { Redirect, Stack } from "expo-router";
import { useMemo } from "react";

import { useAuthSession } from "@/auth/useAuthSession";
import { useWorkspaceIdentity } from "@/auth/useWorkspaceIdentity";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AppLayout() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const workspace = useWorkspaceIdentity();
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

  if (!hydrationComplete || !isReady || (canAccessApp && workspace.status === "loading")) {
    return <AppBootScreen />;
  }

  if (!canAccessApp) {
    return <Redirect href="/(auth)" />;
  }

  if (workspace.status !== "ready") {
    return <Redirect href="/(auth)/choose-workspace" />;
  }

  return (
    <Stack
      screenOptions={screenOptions}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="threads" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
