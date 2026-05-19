import { Redirect, Stack } from "expo-router";

import { useAuthSession } from "@/auth/useAuthSession";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AuthLayout() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, canUpgrade, isReady } = useAuthSession();
  const { colors } = useTheme();

  if (!hydrationComplete || !isReady) {
    return <AppBootScreen />;
  }

  if (canAccessApp && !canUpgrade) {
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
      <Stack.Screen name="email-options" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
