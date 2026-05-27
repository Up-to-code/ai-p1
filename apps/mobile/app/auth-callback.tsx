import { Redirect } from "expo-router";

import { useAuthSession } from "@/auth/useAuthSession";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AuthCallbackScreen() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();

  if (!hydrationComplete || !isReady) {
    return <AppBootScreen />;
  }

  return <Redirect href={canAccessApp ? "/" : "/(auth)"} />;
}
