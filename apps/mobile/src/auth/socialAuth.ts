export const MOBILE_AUTH_CALLBACK_URL = "/auth-callback";

export type MobileSocialProvider = "apple" | "google";

export const mobileSocialProviders: readonly MobileSocialProvider[] =
  process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === "true"
    ? ["apple", "google"]
    : ["google"];

type AuthError = { message?: string; code?: string } | null | undefined;

type SocialAuthClient = {
  signIn: {
    social: (input: {
      provider: MobileSocialProvider;
      callbackURL: string;
    }) => Promise<{ error?: AuthError } | undefined>;
  };
  getSession: () => Promise<unknown>;
};

let activeSocialSignIn: Promise<void> | null = null;

export function socialAuthError(error: AuthError, provider: MobileSocialProvider) {
  return error?.message ?? error?.code ?? `${provider} sign in is not configured for this environment.`;
}

export async function signInWithWorkspaceSocialProvider(
  client: SocialAuthClient,
  provider: MobileSocialProvider,
) {
  if (activeSocialSignIn) {
    return activeSocialSignIn;
  }

  activeSocialSignIn = (async () => {
    const result = await client.signIn.social({
      provider,
      callbackURL: MOBILE_AUTH_CALLBACK_URL,
    });

    if (result?.error) {
      throw new Error(socialAuthError(result.error, provider));
    }

    await client.getSession();
  })();

  try {
    await activeSocialSignIn;
  } finally {
    activeSocialSignIn = null;
  }
}
