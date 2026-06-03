import { Redirect } from "expo-router";

import { mobilePostAuthRoute } from "@/auth/authNavigation";
import { useAuthSession } from "@/auth/useAuthSession";
import { useWorkspaceIdentity } from "@/auth/useWorkspaceIdentity";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AuthCallbackScreen() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const workspace = useWorkspaceIdentity();

  if (!hydrationComplete || !isReady || (canAccessApp && workspace.status === "loading")) {
    return <AppBootScreen />;
  }

  return <Redirect href={mobilePostAuthRoute({ canAccessApp, workspaceStatus: workspace.status })} />;
}
