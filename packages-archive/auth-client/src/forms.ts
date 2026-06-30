"use client";

export type EmailPasswordSignInClient = {
  signIn: {
    email: (input: {
      email: string;
      password: string;
      callbackURL: string;
      rememberMe?: boolean;
    }) => Promise<{ error?: unknown | null }>;
  };
};

export type SignOutClient = {
  signOut: () => Promise<unknown>;
};

export type EmailPasswordSignInInput = {
  email: string;
  password: string;
  callbackURL: string;
  rememberMe?: boolean;
};

export async function signInWithEmailPassword(
  authClient: EmailPasswordSignInClient,
  input: EmailPasswordSignInInput,
) {
  return authClient.signIn.email({
    ...input,
    email: input.email.trim(),
  });
}

export async function signOutWithAuthClient(authClient: SignOutClient) {
  return authClient.signOut();
}
