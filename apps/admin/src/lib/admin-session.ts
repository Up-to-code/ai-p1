import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { adminSecurityConfig } from "./security";
import { resolveAdminRoles, type AdminRole } from "./admin-roles";

export const ADMIN_SESSION_COOKIE = "qentrah_admin_session";
const SESSION_VERSION = 1;
const SESSION_TTL_MS = 1000 * 60 * 60 * 4;

export type AdminSessionPayload = {
  v: typeof SESSION_VERSION;
  userId: string;
  email: string;
  name: string | null;
  roles: AdminRole[];
  iat: number;
  exp: number;
};

type AdminCredential = {
  email: string;
  passwordHash: string;
  name?: string;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function secretFromEnv(env: Record<string, string | undefined>) {
  const secret = env.ADMIN_AUTH_SECRET?.trim() || env.BETTER_AUTH_SECRET?.trim() || "";
  if (secret.length < 32) throw new Error("ADMIN_AUTH_SECRET or BETTER_AUTH_SECRET must be at least 32 characters.");
  return secret;
}

function parseCredentials(env: Record<string, string | undefined>) {
  const entries = (env.ADMIN_AUTH_CREDENTIALS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry): AdminCredential | null => {
      const [email, passwordHash, name] = entry.split(":").map((part) => part.trim());
      if (!email || !passwordHash) return null;
      return { email: email.toLowerCase(), passwordHash, name };
    })
    .filter((entry): entry is AdminCredential => Boolean(entry));

  const singleEmail = env.ADMIN_AUTH_EMAIL?.trim().toLowerCase();
  const singlePasswordHash = env.ADMIN_AUTH_PASSWORD_SHA256?.trim();
  if (singleEmail && singlePasswordHash) {
    entries.push({ email: singleEmail, passwordHash: singlePasswordHash, name: env.ADMIN_AUTH_NAME?.trim() });
  }

  return entries;
}

export function adminCredentialConfigured(env: Record<string, string | undefined> = process.env) {
  return parseCredentials(env).length > 0;
}

export function verifyAdminCredential(email: string, password: string, env: Record<string, string | undefined> = process.env) {
  const normalizedEmail = email.trim().toLowerCase();
  const suppliedHash = sha256(password);
  const credential = parseCredentials(env).find((candidate) => candidate.email === normalizedEmail);
  if (!credential) return null;
  if (!/^[a-f0-9]{64}$/iu.test(credential.passwordHash)) return null;
  if (!safeEqual(suppliedHash, credential.passwordHash.toLowerCase())) return null;

  const roles = resolveAdminRoles(normalizedEmail, env);
  if (roles.length === 0) return null;

  return {
    userId: `admin_env_${sha256(normalizedEmail).slice(0, 16)}`,
    email: normalizedEmail,
    name: credential.name ?? null,
    roles,
  };
}

export async function signAdminSession(
  identity: Pick<AdminSessionPayload, "userId" | "email" | "name" | "roles">,
  env: Record<string, string | undefined> = process.env,
  now = Date.now(),
) {
  const payload: AdminSessionPayload = {
    v: SESSION_VERSION,
    ...identity,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secretFromEnv(env)).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSession(token: string | undefined, env: Record<string, string | undefined> = process.env, now = Date.now()) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = createHmac("sha256", secretFromEnv(env)).update(encodedPayload).digest("base64url");
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminSessionPayload>;
    if (payload.v !== SESSION_VERSION) return null;
    if (!payload.email || !payload.userId || !Array.isArray(payload.roles)) return null;
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;
    const currentRoles = resolveAdminRoles(payload.email, env);
    if (currentRoles.length === 0) return null;
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name ?? null,
      image: null,
      roles: currentRoles,
    };
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions() {
  const secure = adminSecurityConfig().adminOrigin.startsWith("https://") || process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "Lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
