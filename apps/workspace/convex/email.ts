import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

export const resend = new Resend(components.resend, {
  testMode: process.env.RESEND_TEST_MODE !== "false",
});

const defaultFromEmail = "Qentrah <onboarding@resend.dev>";

export function getTransactionalFromEmail() {
  return process.env.RESEND_FROM_EMAIL || defaultFromEmail;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "http://localhost:3000";
}
