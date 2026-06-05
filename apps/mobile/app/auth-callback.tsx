import { Redirect } from "expo-router";

import { useMobileAuthGate } from "@/auth/mobileAuthGate";
import { AppBootScreen } from "@/shell/components/AppBootScreen";

export default function AuthCallbackScreen() {
  const gate = useMobileAuthGate();

  if (!gate.isReady || !gate.destination) {
    return <AppBootScreen />;
  }

  return <Redirect href={gate.destination} />;
}
