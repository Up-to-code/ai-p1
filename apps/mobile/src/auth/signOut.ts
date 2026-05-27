import { authClient } from "@/auth/authClient";
import { resetE2EAuthState } from "@/e2e/store";
import { useAppStore } from "@/store";

export async function signOutForAccountSwitch() {
  const state = useAppStore.getState();
  state.resetConversationState();

  if (state.e2eQaMode) {
    resetE2EAuthState();
    return;
  }

  state.setE2EForceAuthScreen(true);
  await authClient.signOut().catch(() => undefined);
}

export function markAuthSessionActive() {
  useAppStore.getState().setE2EForceAuthScreen(false);
}
