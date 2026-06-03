import { Redirect, Stack, useSegments } from "expo-router";
import { useMemo } from "react";

import { mobilePostAuthRoute } from "@/auth/authNavigation";
import { useAuthSession } from "@/auth/useAuthSession";
import { useWorkspaceIdentity } from "@/auth/useWorkspaceIdentity";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AuthLayout() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const workspace = useWorkspaceIdentity();
  const { colors } = useTheme();
  const segments = useSegments();
  const authRoute = segments[1];
  const canStayInAuth = authRoute === "choose-workspace" || authRoute === "accept-invite";
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

  if (!hydrationComplete || !isReady || (canAccessApp && workspace.status === "loading")) {
    return <AppBootScreen />;
  }

  if (canAccessApp && !canStayInAuth) {
    return <Redirect href={mobilePostAuthRoute({ canAccessApp, workspaceStatus: workspace.status })} />;
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
