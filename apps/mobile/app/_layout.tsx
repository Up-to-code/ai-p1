import { Stack } from "expo-router";
import { useMemo } from "react";

import { AppProviders } from "@/shell/providers/AppProviders";

export default function RootLayout() {
  const rootScreenOptions = useMemo(() => ({ headerShown: false }), []);
  const fastFadeOptions = useMemo(() => ({ animation: "fade" as const, animationDuration: 120 }), []);
  const noAnimationOptions = useMemo(() => ({ animation: "none" as const }), []);

  return (
    <AppProviders>
      <Stack screenOptions={rootScreenOptions}>
        <Stack.Screen name="index" options={noAnimationOptions} />
        <Stack.Screen name="(auth)" options={fastFadeOptions} />
        <Stack.Screen name="(app)" options={fastFadeOptions} />
        <Stack.Screen name="+not-found" options={fastFadeOptions} />
      </Stack>
    </AppProviders>
  );
}
