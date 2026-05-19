import { Redirect, Stack } from "expo-router";

import { useAuthSession } from "@/auth/useAuthSession";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AppLayout() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const { colors } = useTheme();

  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

  if (!hydrationComplete || !isReady) {
    return <AppBootScreen />;
  }

  if (!canAccessApp) {
    return <Redirect href="/(auth)" />;
  }

  if (!onboardingComplete) {
    return <Redirect href="/(onboarding)" />;
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
      <Stack.Screen name="saved" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="language" />
      <Stack.Screen name="compare" />
      <Stack.Screen name="listing" />
      <Stack.Screen name="listing-map" />
      <Stack.Screen name="listing-filters" />
      <Stack.Screen name="errors/index" />
      <Stack.Screen name="errors/[kind]" />
      <Stack.Screen name="property/[id]" />
      <Stack.Screen name="broker/[id]" />
    </Stack>
  );
}
