import { PropsWithChildren, useEffect } from "react";
import { ClerkProvider, useAuth, useClerk } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

import { getClerkPublishableKey } from "@/runtime/expoRuntime";
import { setWorkspaceAuthTokenGetter } from "@/persistence/api/workspaceApiClient";
import { isValidClerkPublishableKey, setActiveClerkRuntime } from "@/auth/authClient";

type AuthProviderProps = PropsWithChildren;

function ClerkRuntimeBridge() {
  const { getToken } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    setActiveClerkRuntime(clerk);
    setWorkspaceAuthTokenGetter(() => getToken());

    return () => {
      setActiveClerkRuntime(null);
      setWorkspaceAuthTokenGetter(null);
    };
  }, [clerk, getToken]);

  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const publishableKey = getClerkPublishableKey();

  if (!isValidClerkPublishableKey(publishableKey)) {
    setWorkspaceAuthTokenGetter(null);
    setActiveClerkRuntime(null);
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      appearance={{
        captcha: {
          size: "flexible",
          theme: "auto",
        },
      }}
    >
      <ClerkRuntimeBridge />
      {children}
    </ClerkProvider>
  );
}
