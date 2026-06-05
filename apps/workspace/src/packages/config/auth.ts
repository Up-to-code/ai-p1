import { envReader } from "./env-reader";

export function parsePlatformAdminEmails(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export const platformAdminEmails = parsePlatformAdminEmails(
  envReader.read("PLATFORM_ADMIN_EMAILS", ""),
);

export function isPlatformAdminEmail(
  email: string | null | undefined,
  allowlist = platformAdminEmails,
) {
  if (!email) return false;
  return allowlist.includes(email.trim().toLowerCase());
}
