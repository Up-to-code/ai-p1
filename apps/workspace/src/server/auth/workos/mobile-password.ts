import { assertWorkOSConfigured, getWorkOSClient } from "@/server/auth/workos";
import { workosRuntimeConfig } from "@/packages/config";

export type MobilePasswordAuthInput = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  ipAddress?: string;
  userAgent?: string;
};

export type MobilePasswordAuthResult = {
  sealedSession: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  organizationId?: string;
};

export type MobileEmailVerificationChallenge = {
  code: "email_verification_required";
  email: string;
  emailVerificationId?: string;
  pendingAuthenticationToken: string;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return stringValue(value).toLowerCase();
}

export function mobileAuthErrorMessage(error: unknown, fallback = "Qentrah could not complete this request.") {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const normalized = (raw || fallback)
    .replace(/workos authkit/giu, "Qentrah sign-in")
    .replace(/workos/giu, "Qentrah")
    .replace(/authkit/giu, "Qentrah sign-in")
    .trim();
  if (!normalized) return fallback;
  if (/api key|client id|not configured|configuration|cookie password|required environment/iu.test(normalized)) {
    return "Qentrah sign-in is not ready in this build.";
  }
  if (/invalid|incorrect|password|credentials|not found|no user|unknown user/iu.test(normalized)) {
    return "The email or password does not match a Qentrah account.";
  }
  if (/rate limit|too many|requests/iu.test(normalized)) {
    return "Too many attempts. Wait a minute, then try again.";
  }
  return normalized;
}

export function mobileOAuthErrorMessage(error: unknown, fallback = "Qentrah sign-in callback failed.") {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const normalized = (raw || fallback)
    .replace(/workos authkit/giu, "Qentrah sign-in")
    .replace(/workos/giu, "Qentrah")
    .replace(/authkit/giu, "Qentrah sign-in")
    .trim();
  if (!normalized) return fallback;
  if (/api key|client id|not configured|configuration|provider.*not.*found|required environment/iu.test(normalized)) {
    return "Qentrah social sign-in is not ready in this build.";
  }
  if (/email or password|invalid|incorrect|credentials|not found|no user|unknown user/iu.test(normalized)) {
    return "No Qentrah account is linked to this social sign-in. Create an account first or sign in with email.";
  }
  if (/rate limit|too many|requests/iu.test(normalized)) {
    return "Too many attempts. Wait a minute, then try again.";
  }
  return normalized;
}

function validateEmailPassword(input: MobilePasswordAuthInput) {
  const email = normalizeEmail(input.email);
  const password = stringValue(input.password);
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  return { email, password };
}

function displayName(user: { firstName?: string | null; lastName?: string | null; email: string }) {
  const name = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(" ");
  return name || user.email;
}

function authResult(input: {
  sealedSession?: string;
  organizationId?: string;
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null };
}) {
  if (!input.sealedSession) {
    throw new Error("Qentrah did not return a mobile session.");
  }

  return {
    sealedSession: input.sealedSession,
    user: {
      id: input.user.id,
      email: input.user.email,
      name: displayName(input.user),
    },
    organizationId: input.organizationId,
  } satisfies MobilePasswordAuthResult;
}

function rawErrorData(error: unknown) {
  if (!error || typeof error !== "object" || !("rawData" in error)) return null;
  const rawData = (error as { rawData?: unknown }).rawData;
  return rawData && typeof rawData === "object" ? rawData as Record<string, unknown> : null;
}

export function mobileEmailVerificationChallenge(error: unknown): MobileEmailVerificationChallenge | null {
  const rawData = rawErrorData(error);
  if (rawData?.code !== "email_verification_required") return null;
  const pendingAuthenticationToken = stringValue(rawData.pending_authentication_token);
  const user = rawData.user && typeof rawData.user === "object"
    ? rawData.user as { email?: unknown }
    : null;
  const email = normalizeEmail(rawData.email || user?.email);
  if (!pendingAuthenticationToken || !email) return null;
  return {
    code: "email_verification_required",
    email,
    emailVerificationId: stringValue(rawData.email_verification_id) || undefined,
    pendingAuthenticationToken,
  };
}

function splitFullName(value: unknown) {
  const name = stringValue(value);
  if (!name) throw new Error("Name, email, and password are required.");
  const [firstName, ...rest] = name.split(/\s+/u);
  return {
    firstName,
    lastName: rest.join(" ") || undefined,
  };
}

function authOptions(input: MobilePasswordAuthInput) {
  if (!workosRuntimeConfig.cookiePassword) {
    throw new Error("WorkOS cookie password is required.");
  }

  return {
    clientId: workosRuntimeConfig.clientId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    session: {
      sealSession: true,
      cookiePassword: workosRuntimeConfig.cookiePassword,
    },
  };
}

async function authenticate(input: MobilePasswordAuthInput) {
  assertWorkOSConfigured();
  const { email, password } = validateEmailPassword(input);
  const auth = await getWorkOSClient().userManagement.authenticateWithPassword({
    ...authOptions(input),
    email,
    password,
  });

  return authResult(auth);
}

export async function signInWithMobilePassword(input: MobilePasswordAuthInput) {
  return authenticate(input);
}

export async function registerWithMobilePassword(input: MobilePasswordAuthInput) {
  assertWorkOSConfigured();
  const { email, password } = validateEmailPassword(input);
  const { firstName, lastName } = splitFullName(input.name);
  await getWorkOSClient().userManagement.createUser({
    email,
    password,
    firstName,
    lastName,
  });
  return authenticate({ ...input, email, password });
}

export async function requestMobilePasswordReset(input: { email?: unknown }) {
  assertWorkOSConfigured();
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("Email is required.");
  await getWorkOSClient().userManagement.createPasswordReset({ email });
}

export async function confirmMobilePasswordReset(input: {
  token?: unknown;
  newPassword?: unknown;
}) {
  assertWorkOSConfigured();
  const token = stringValue(input.token);
  const newPassword = stringValue(input.newPassword);
  if (!token || !newPassword) {
    throw new Error("Reset token and new password are required.");
  }
  await getWorkOSClient().userManagement.resetPassword({
    token,
    newPassword,
  });
}

export async function confirmMobileEmailVerification(input: {
  code?: unknown;
  pendingAuthenticationToken?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) {
  assertWorkOSConfigured();
  const code = stringValue(input.code);
  const pendingAuthenticationToken = stringValue(input.pendingAuthenticationToken);
  if (!code || !pendingAuthenticationToken) {
    throw new Error("Verification code is required.");
  }

  const auth = await getWorkOSClient().userManagement.authenticateWithEmailVerification({
    ...authOptions({
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    }),
    code,
    pendingAuthenticationToken,
  });

  return authResult(auth);
}
