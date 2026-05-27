import { Redirect, Stack } from "expo-router";

import { useAuthSession } from "@/auth/useAuthSession";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AppLayout() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const { colors } = useTheme();

  if (!hydrationComplete || !isReady) {
    return <AppBootScreen />;
  }

  if (!canAccessApp) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "fade",
        animationDuration: 120,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
