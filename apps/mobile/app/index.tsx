import { Redirect } from "expo-router";

import { useAuthSession } from "@/auth/useAuthSession";
import { useWorkspaceIdentity } from "@/auth/useWorkspaceIdentity";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function IndexScreen() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const workspace = useWorkspaceIdentity();

  if (!hydrationComplete || !isReady || (canAccessApp && workspace.status === "loading")) {
    return <AppBootScreen />;
  }

  if (!canAccessApp) {
    return <Redirect href="/(auth)" />;
  }

  return <Redirect href={workspace.status === "ready" ? "/(app)" : "/(auth)/choose-workspace"} />;
}
