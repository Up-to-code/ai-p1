import { Redirect } from "expo-router";

import { useAuthSession } from "@/auth/useAuthSession";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function OnboardingLayout() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();

  if (!hydrationComplete || !isReady) {
    return <AppBootScreen />;
  }

  if (!canAccessApp) {
    return <Redirect href="/(auth)" />;
  }

  return <Redirect href="/(app)" />;
}
