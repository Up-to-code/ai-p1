import { Stack } from "expo-router";
import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { AppProviders } from "@/shell/providers/AppProviders";

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const launchBackground = systemColorScheme === "dark" ? "#000000" : "#FFFFFF";
  const rootScreenOptions = useMemo(
    () => ({ headerShown: false, contentStyle: { backgroundColor: launchBackground } }),
    [launchBackground],
  );
  const fastFadeOptions = useMemo(() => ({ animation: "fade" as const, animationDuration: 120 }), []);
  const noAnimationOptions = useMemo(() => ({ animation: "none" as const }), []);

  return (
    <AppProviders>
      <Stack screenOptions={rootScreenOptions}>
        <Stack.Screen name="index" options={noAnimationOptions} />
        <Stack.Screen name="(auth)" options={fastFadeOptions} />
        <Stack.Screen name="(app)" options={fastFadeOptions} />
        <Stack.Screen name="sso-callback" options={noAnimationOptions} />
        <Stack.Screen name="+not-found" options={fastFadeOptions} />
      </Stack>
    </AppProviders>
  );
}
