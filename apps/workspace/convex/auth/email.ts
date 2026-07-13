import { requireRunMutationCtx } from "@convex-dev/better-auth/utils";
import { emailOTP } from "better-auth/plugins";
import { getTransactionalFromEmail, resend } from "../email";
import { asBetterAuthAdapterContext, type BetterAuthRuntimeContext } from "./runtime";

function passwordResetMessage(url: string) {
  return {
    subject: "Reset your Qentrah password",
    html: [
      "<p>We received a request to reset your Qentrah password.</p>",
      `<p><a href="${url}">Reset your password</a></p>`,
      "<p>If you did not request this, you can ignore this email.</p>",
    ].join(""),
    text: [
      "We received a request to reset your Qentrah password.",
      "",
      `Reset your password: ${url}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  };
}

export function createEmailAndPasswordOptions(ctx: BetterAuthRuntimeContext) {
  return {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      await resend.sendEmail(requireRunMutationCtx(asBetterAuthAdapterContext(ctx)), {
        from: getTransactionalFromEmail(),
        to: user.email,
        ...passwordResetMessage(url),
      });
    },
  };
}

export function createEmailOtpPlugin(ctx: BetterAuthRuntimeContext) {
  return emailOTP({
    expiresIn: 10 * 60,
    allowedAttempts: 5,
    sendVerificationOTP: async ({ email, otp, type }) => {
      const subject = type === "forget-password"
        ? "Your Qentrah password reset code"
        : "Your Qentrah verification code";
      const intro = type === "forget-password"
        ? "Use this code to reset your Qentrah password."
        : "Use this code to verify your Qentrah account.";

      await resend.sendEmail(requireRunMutationCtx(asBetterAuthAdapterContext(ctx)), {
        from: getTransactionalFromEmail(),
        to: email,
        subject,
        html: [
          `<p>${intro}</p>`,
          `<p style="font-size: 24px; font-weight: 700; letter-spacing: 0.2em;">${otp}</p>`,
          "<p>This code expires in 10 minutes.</p>",
          "<p>If you did not request this, you can ignore this email.</p>",
        ].join(""),
        text: [
          intro,
          "",
          otp,
          "",
          "This code expires in 10 minutes.",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
      });
    },
  });
}
