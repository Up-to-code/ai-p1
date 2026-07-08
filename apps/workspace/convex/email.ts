import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

export const resend = new Resend(components.resend, {
  testMode: process.env.RESEND_TEST_MODE === "true",
});

const defaultFromEmail = "Qentrah Support <support@updates.qentrah.com>";
const defaultUpdatesFromEmail =
  "Ahmed, CEO of Qentrah <ceo@updates.qentrah.com>";

function validEmailSender(value: string | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("re_")) return null;
  return trimmed.includes("@") ? trimmed : null;
}

export function getTransactionalFromEmail() {
  return validEmailSender(process.env.RESEND_FROM_EMAIL) || defaultFromEmail;
}

export function getUpdatesFromEmail() {
  return (
    validEmailSender(process.env.RESEND_UPDATES_FROM_EMAIL) ||
    validEmailSender(process.env.RESEND_FROM_EMAIL) ||
    defaultUpdatesFromEmail
  );
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000"
  );
}
