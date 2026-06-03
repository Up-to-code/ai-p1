/* eslint-disable max-lines */
export const MOBILE_AUTH_CALLBACK_URL = "qentrah:///auth-callback";

export type MobileSocialProvider = "apple" | "google";
export type MobileAuthScreenHint = "sign-in" | "sign-up";
export type MobileEmailVerificationChallenge = {
  code: "email_verification_required";
  email: string;
  emailVerificationId?: string;
  pendingAuthenticationToken: string;
};
export type MobilePasswordAuthError = AuthError & {
  emailVerification?: MobileEmailVerificationChallenge;
};

export const mobileSocialProviders: readonly MobileSocialProvider[] = ["apple", "google"];

type AuthError = { message?: string; code?: string } | null | undefined;

type SocialAuthClient = {
  signIn: {
    social: (input: {
      provider?: MobileSocialProvider;
      callbackURL?: string;
      screenHint?: MobileAuthScreenHint;
    }) => Promise<{ error?: AuthError } | undefined>;
    password?: (input: {
      email: string;
      password: string;
      callbackURL?: string;
    }) => Promise<{ error?: MobilePasswordAuthError } | undefined>;
  };
  signUp?: {
    emailPassword?: (input: {
      name: string;
      email: string;
      password: string;
      callbackURL?: string;
    }) => Promise<{ error?: MobilePasswordAuthError } | undefined>;
  };
  requestPasswordReset?: (input: {
    email: string;
  }) => Promise<{ error?: AuthError } | undefined>;
  confirmPasswordReset?: (input: {
    token: string;
    newPassword: string;
  }) => Promise<{ error?: AuthError } | undefined>;
  confirmEmailVerification?: (input: {
    code: string;
    pendingAuthenticationToken: string;
  }) => Promise<{ error?: AuthError } | undefined>;
  getSession: () => Promise<unknown>;
};

let activeSocialSignIn: Promise<void> | null = null;

export function socialAuthError(error: AuthError, provider: MobileSocialProvider) {
  return error?.message ?? error?.code ?? `${provider} sign in is not configured for this environment.`;
}

function authKitError(error: AuthError) {
  return error?.message ?? error?.code ?? "Qentrah sign-in is not configured for this environment.";
}

export function workOSAuthFlowError(error: MobilePasswordAuthError) {
  const next = new Error(authKitError(error)) as Error & {
    emailVerification?: MobileEmailVerificationChallenge;
  };
  if (error?.emailVerification) next.emailVerification = error.emailVerification;
  return next;
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

export async function signInWithWorkspaceEmailPassword(
  client: SocialAuthClient,
  input: { email: string; password: string },
) {
  if (activeSocialSignIn) {
    return activeSocialSignIn;
  }

  activeSocialSignIn = (async () => {
    if (!client.signIn.password) {
      throw new Error("Qentrah password sign in is not configured for this environment.");
    }
    const result = await client.signIn.password({
      email: input.email,
      password: input.password,
    });

    if (result?.error) {
      throw workOSAuthFlowError(result.error);
    }

    await client.getSession();
  })();

  try {
    await activeSocialSignIn;
  } finally {
    activeSocialSignIn = null;
  }
}

export async function registerWithWorkspaceEmailPassword(
  client: SocialAuthClient,
  input: { name: string; email: string; password: string },
) {
  if (activeSocialSignIn) {
    return activeSocialSignIn;
  }

  activeSocialSignIn = (async () => {
    if (!client.signUp?.emailPassword) {
      throw new Error("Qentrah password registration is not configured for this environment.");
    }
    const result = await client.signUp.emailPassword({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    if (result?.error) {
      throw workOSAuthFlowError(result.error);
    }

    await client.getSession();
  })();

  try {
    await activeSocialSignIn;
  } finally {
    activeSocialSignIn = null;
  }
}

export async function requestWorkspacePasswordReset(
  client: SocialAuthClient,
  email: string,
) {
  if (!client.requestPasswordReset) {
    throw new Error("Qentrah password reset is not configured for this environment.");
  }
  const result = await client.requestPasswordReset({ email });
  if (result?.error) throw new Error(authKitError(result.error));
}

export async function confirmWorkspacePasswordReset(
  client: SocialAuthClient,
  input: { token: string; newPassword: string },
) {
  if (!client.confirmPasswordReset) {
    throw new Error("Qentrah password reset confirmation is not configured for this environment.");
  }
  const result = await client.confirmPasswordReset(input);
  if (result?.error) throw new Error(authKitError(result.error));
}

export async function confirmWorkspaceEmailVerification(
  client: SocialAuthClient,
  input: { code: string; pendingAuthenticationToken: string },
) {
  if (!client.confirmEmailVerification) {
    throw new Error("Qentrah email verification is not configured for this environment.");
  }
  const result = await client.confirmEmailVerification(input);
  if (result?.error) throw new Error(authKitError(result.error));
  await client.getSession();
}
