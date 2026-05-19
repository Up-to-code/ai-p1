import "../global.css";

import { Stack } from "expo-router";

import { AppProviders } from "@/shell/providers/AppProviders";

export default function RootLayout() {
  const fastFadeOptions = { animation: "fade" as const, animationDuration: 120 };

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(auth)" options={fastFadeOptions} />
        <Stack.Screen name="(onboarding)" options={fastFadeOptions} />
        <Stack.Screen name="(app)" options={fastFadeOptions} />
        <Stack.Screen name="+not-found" options={fastFadeOptions} />
      </Stack>
    </AppProviders>
  );
}
