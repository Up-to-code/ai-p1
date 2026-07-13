import { envReader } from "./env-reader";
import {
  isPlatformAdminEmail as matchesPlatformAdminEmail,
  parsePlatformAdminEmails,
} from "@qentrah/auth";

export { parsePlatformAdminEmails };

const platformAdminEmails = parsePlatformAdminEmails(
  envReader.read("PLATFORM_ADMIN_EMAILS", ""),
);

export function isPlatformAdminEmail(
  email: string | null | undefined,
  allowlist = platformAdminEmails,
) {
  return matchesPlatformAdminEmail(email, allowlist);
}
