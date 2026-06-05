export const MOBILE_AUTH_CALLBACK_URL = "/sso-callback";

export type MobileSocialProvider = "apple" | "google";

export const mobileSocialProviders: readonly MobileSocialProvider[] =
  process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === "true"
    ? ["apple", "google"]
    : ["google"];

type AuthError = { message?: string; code?: string } | null | undefined;
type ClerkSsoStrategy = "oauth_apple" | "oauth_google";
type CreateRedirectUrl = (path: string) => string;

export type SocialAuthFlow = {
  startSSOFlow: (input: {
    strategy: ClerkSsoStrategy;
    redirectUrl: string;
  }) => Promise<{
    createdSessionId?: string | null;
    setActive?: (input: { session: string }) => Promise<void>;
  }>;
};

let activeSocialSignIn: Promise<void> | null = null;

export function createWorkspaceAuthRedirectUrl(path = MOBILE_AUTH_CALLBACK_URL) {
  const { createURL } = require("expo-linking") as typeof import("expo-linking");
  return createURL(path);
}

export function socialAuthError(error: AuthError, provider: MobileSocialProvider) {
  return error?.message ?? error?.code ?? `${provider} sign in is not configured for this environment.`;
}

export async function signInWithWorkspaceSocialProvider(
  flow: SocialAuthFlow,
  provider: MobileSocialProvider,
  createRedirectUrl: CreateRedirectUrl = createWorkspaceAuthRedirectUrl,
) {
  if (activeSocialSignIn) {
    return activeSocialSignIn;
  }

  activeSocialSignIn = (async () => {
    const result = await flow.startSSOFlow({
      strategy: `oauth_${provider}` as ClerkSsoStrategy,
      redirectUrl: createRedirectUrl(MOBILE_AUTH_CALLBACK_URL),
    });

    if (result.createdSessionId && result.setActive) {
      await result.setActive({ session: result.createdSessionId });
      return;
    }

    throw new Error(socialAuthError(null, provider));
  })();

  try {
    await activeSocialSignIn;
  } finally {
    activeSocialSignIn = null;
  }
}
