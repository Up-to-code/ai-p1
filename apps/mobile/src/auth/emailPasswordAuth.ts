export type ClerkEmailSignInAdapter = {
  password?: (input: { emailAddress: string; password: string }) => Promise<{ error?: unknown } | undefined>;
  finalize?: () => Promise<unknown>;
  status?: string | null;
};

export type ClerkEmailSignUpAdapter = {
  password?: (input: {
    emailAddress: string;
    firstName?: string;
    lastName?: string;
    password: string;
  }) => Promise<{ error?: unknown } | undefined>;
  finalize?: () => Promise<unknown>;
  status?: string | null;
  verifications?: {
    sendEmailCode?: () => Promise<unknown>;
    verifyEmailCode?: (input: { code: string }) => Promise<{ error?: unknown } | undefined>;
  };
};

type EmailAuthMissingDetails = "login" | "signup";

export type EmailAuthResult =
  | { status: "authenticated" }
  | { status: "needs_verification" }
  | { status: "missing_details"; kind: EmailAuthMissingDetails };

const CLERK_EMAIL_AUTH_TIMEOUT_MS = 12000;

export function clerkEmailAuthErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;
  const record = error as {
    message?: unknown;
    longMessage?: unknown;
    errors?: Array<{ message?: string; longMessage?: string }>;
  };
  const first = record.errors?.[0];
  return (
    first?.longMessage ??
    first?.message ??
    (typeof record.longMessage === "string" ? record.longMessage : undefined) ??
    (typeof record.message === "string" ? record.message : fallback)
  );
}

function emailAuthTimeoutMessage(phase: string) {
  return `Timed out while ${phase}. Check your connection and try again.`;
}

async function withEmailAuthTimeout<T>(promise: Promise<T> | undefined, phase: string): Promise<T | undefined> {
  if (!promise) return undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(emailAuthTimeoutMessage(phase))), CLERK_EMAIL_AUTH_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function signInWithEmailPassword(input: {
  emailAddress: string;
  password: string;
  signIn: ClerkEmailSignInAdapter | null | undefined;
}): Promise<EmailAuthResult> {
  const emailAddress = input.emailAddress.trim();
  if (!emailAddress || !input.password) {
    return { status: "missing_details", kind: "login" };
  }

  const result = await withEmailAuthTimeout(
    input.signIn?.password?.({
      emailAddress,
      password: input.password,
    }),
    "signing in",
  );
  if (result?.error) throw result.error;
  await withEmailAuthTimeout(input.signIn?.finalize?.(), "opening your session");
  return { status: "authenticated" };
}

export async function signUpWithEmailPassword(input: {
  emailAddress: string;
  fullName: string;
  needsVerification: boolean;
  password: string;
  signUp: ClerkEmailSignUpAdapter | null | undefined;
  verificationCode: string;
}): Promise<EmailAuthResult> {
  const emailAddress = input.emailAddress.trim();
  const fullName = input.fullName.trim();
  if (!emailAddress || !fullName || !input.password) {
    return { status: "missing_details", kind: "signup" };
  }

  if (input.needsVerification) {
    if (!input.verificationCode.trim()) {
      return { status: "missing_details", kind: "signup" };
    }

    const result = await withEmailAuthTimeout(
      input.signUp?.verifications?.verifyEmailCode?.({
        code: input.verificationCode.trim(),
      }),
      "verifying your email",
    );
    if (result?.error) throw result.error;
    await withEmailAuthTimeout(input.signUp?.finalize?.(), "opening your session");
    return { status: "authenticated" };
  }

  const [firstName, ...rest] = fullName ? fullName.split(/\s+/) : [];
  const result = await withEmailAuthTimeout(
    input.signUp?.password?.({
      emailAddress,
      password: input.password,
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
    }),
    "creating your account",
  );
  if (result?.error) throw result.error;
  await withEmailAuthTimeout(
    input.signUp?.verifications?.sendEmailCode?.(),
    "sending your email code",
  );
  return { status: "needs_verification" };
}

export async function sendSignUpEmailVerificationCode(input: {
  signUp: ClerkEmailSignUpAdapter | null | undefined;
}) {
  await withEmailAuthTimeout(
    input.signUp?.verifications?.sendEmailCode?.(),
    "sending your email code",
  );
}
