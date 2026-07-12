export const MOBILE_AUTH_CALLBACK_URL = "/sso-callback";
export type MobileSocialProvider = "apple" | "google";

export const mobileSocialProviders: readonly MobileSocialProvider[] =
  process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === "true" ? ["apple", "google"] : ["google"];

type AuthError = { message?: string; code?: string } | null | undefined;
let activeSocialSignIn: Promise<void> | null = null;

export function socialAuthError(error: AuthError, provider: MobileSocialProvider) {
  return error?.message ?? error?.code ?? `${provider} sign in is not configured for this environment.`;
}

type SocialAuthClient = {
  signIn: {
    social: (input: { provider: MobileSocialProvider; callbackURL: string }) => Promise<{ error?: AuthError }>;
  };
};

export async function signInWithWorkspaceSocialProvider(
  provider: MobileSocialProvider,
  client?: SocialAuthClient,
) {
  if (activeSocialSignIn) return activeSocialSignIn;
  activeSocialSignIn = (async () => {
    const target = client ?? (await import("./authClient")).authClient;
    const result = await target.signIn.social({
      provider,
      callbackURL: MOBILE_AUTH_CALLBACK_URL,
    });
    if (result.error) throw new Error(socialAuthError(result.error, provider));
  })();
  try {
    await activeSocialSignIn;
  } finally {
    activeSocialSignIn = null;
  }
}
