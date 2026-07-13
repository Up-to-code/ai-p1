export type PlatformAdminAllowlist = string | readonly string[];

/** Normalize the configured platform-admin email allowlist once at the policy seam. */
export function parsePlatformAdminEmails(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

/** Pure platform-admin policy shared by Next.js and Convex adapters. */
export function isPlatformAdminEmail(
  email: string | null | undefined,
  allowlist: PlatformAdminAllowlist,
): boolean {
  if (!email) return false;
  const entries = typeof allowlist === "string"
    ? parsePlatformAdminEmails(allowlist)
    : allowlist;
  return entries.includes(email.trim().toLowerCase());
}
