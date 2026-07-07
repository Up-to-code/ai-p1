import { betterAuth } from "better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireRunMutationCtx } from "@convex-dev/better-auth/utils";
import { organization } from "better-auth/plugins";
import { betterAuthClient } from "./betterAuth";
import authConfig from "./auth.config";
import { getAuthUser, safeGetAuthUser } from "./betterAuth";
import { getAppUrl, getTransactionalFromEmail, resend } from "./email";

export const createAuth = (ctx: any) => {
  return betterAuth({
    database: betterAuthClient.adapter(ctx),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await resend.sendEmail(requireRunMutationCtx(ctx), {
          from: getTransactionalFromEmail(),
          to: user.email,
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
        });
      },
    },

    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      } : {}),
      ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET ? {
        apple: {
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET,
        },
      } : {}),
    },

    plugins: [
      organization({
        sendInvitationEmail: async ({ invitation, inviter, organization }) => {
          const inviteUrl = `${getAppUrl()}/en/accept-invite?invitationId=${invitation.id}`;
          const invitedBy = inviter.user.name || inviter.user.email || "A teammate";

          await resend.sendEmail(requireRunMutationCtx(ctx), {
            from: getTransactionalFromEmail(),
            to: invitation.email,
            subject: `${invitedBy} invited you to join ${organization.name} on Qentrah`,
            html: [
              `<p>${invitedBy} invited you to join ${organization.name} on Qentrah.</p>`,
              `<p><a href="${inviteUrl}">Accept invitation</a></p>`,
              "<p>If you were not expecting this invitation, you can ignore this email.</p>",
            ].join(""),
            text: [
              `${invitedBy} invited you to join ${organization.name} on Qentrah.`,
              "",
              `Accept invitation: ${inviteUrl}`,
              "",
              "If you were not expecting this invitation, you can ignore this email.",
            ].join("\n"),
          });
        },
      }),
      convex({ authConfig }),
    ],

    baseURL: process.env.NEXT_PUBLIC_APP_URL!,
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
    trustedProxyHeaders: true,
    secret: process.env.BETTER_AUTH_SECRET!,
  });
};

export { getAuthUser, safeGetAuthUser } from "./betterAuth";

/**
 * Backward-compatible alias for Better Auth `getAuthUser`/`safeGetAuthUser`.
 * Used by 30+ Convex write/read modules. Imported as:
 *   import { authUser } from "../auth";
 *   const user = await authUser.getAuthUser(ctx);
 */
export const authUser = {
  getAuthUser: async (ctx: any) => getAuthUser(ctx),
  safeGetAuthUser: async (ctx: any) => safeGetAuthUser(ctx),
  getAuth: async (_createAuth: unknown, ctx: any) => {
    const auth = createAuth(ctx as any);
    return { auth, headers: new Headers() };
  },
  clientApi: () => ({
    getAuthUser: async (ctx: any) => getAuthUser(ctx),
    safeGetAuthUser: async (ctx: any) => safeGetAuthUser(ctx),
  }),
};
