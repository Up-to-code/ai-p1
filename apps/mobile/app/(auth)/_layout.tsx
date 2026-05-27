import { Redirect, Stack, useSegments } from "expo-router";

import { useAuthSession } from "@/auth/useAuthSession";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AuthLayout() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const { colors } = useTheme();
  const segments = useSegments();
  const authRoute = segments[1];
  const canStayInAuth = authRoute === "choose-workspace" || authRoute === "accept-invite";

  if (!hydrationComplete || !isReady) {
    return <AppBootScreen />;
  }

  if (canAccessApp && !canStayInAuth) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "none",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="choose-workspace" />
      <Stack.Screen name="accept-invite" />
    </Stack>
  );
}
