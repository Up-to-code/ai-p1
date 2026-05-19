import { PropsWithChildren, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "@expo-google-fonts/manrope";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AuthProvider } from "@/auth/AuthProvider";
import { LocalizationProvider } from "@/foundation/localization";
import { ThemeProvider, useTheme } from "@/foundation/theme/ThemeProvider";
import { SessionTracker } from "@/persistence/analytics/SessionTracker";
import { useAppStore } from "@/store";
import { appFonts } from "./appFonts";
import { FontLoadScreen } from "./FontLoadScreen";

export function AppProviders({ children }: PropsWithChildren) {
  const [fontsLoaded] = useFonts(appFonts);
  if (!fontsLoaded) return <FontLoadScreen />;
  return (
    <LocalizationProvider>
      <ThemeProvider>
        <ThemedAppChrome>{children}</ThemedAppChrome>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

function ThemedAppChrome({ children }: PropsWithChildren) {
  const { resolvedColorScheme, colors } = useTheme();
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const setHydrationComplete = useAppStore((state) => state.setHydrationComplete);

  useEffect(() => { if (!hydrationComplete) setHydrationComplete(true); }, [hydrationComplete, setHydrationComplete]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardProvider>
          <AuthProvider>
            <SessionTracker>
              <StatusBar style={resolvedColorScheme === "dark" ? "light" : "dark"} />
              {children}
            </SessionTracker>
          </AuthProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
