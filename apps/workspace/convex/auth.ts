import { betterAuth } from "better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireRunMutationCtx } from "@convex-dev/better-auth/utils";
import { emailOTP, jwt, lastLoginMethod, organization } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { i18n } from "@better-auth/i18n";
import { expo } from "@better-auth/expo";
import { betterAuthClient } from "./betterAuth";
import authConfig from "./auth.config";
import { getAuthUser, safeGetAuthUser } from "./betterAuth";
import { getAppUrl, getTransactionalFromEmail, resend } from "./email";

export const createAuth = (ctx: any) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const appOrigin = appUrl.replace(/\/$/u, "");
  const defaultMcpResource = new URL(appOrigin).hostname === "app.qentrah.com"
    ? "https://mcp.qentrah.com/mcp"
    : `${appOrigin}/mcp`;
  const mcpResource = (process.env.MCP_RESOURCE_URL ?? defaultMcpResource).replace(/\/$/u, "");

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
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
      ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
        ? {
            apple: {
              clientId: process.env.APPLE_CLIENT_ID,
              clientSecret: process.env.APPLE_CLIENT_SECRET,
            },
          }
        : {}),
    },

    plugins: [
      emailOTP({
        expiresIn: 10 * 60,
        allowedAttempts: 5,
        sendVerificationOTP: async ({ email, otp, type }) => {
          const subject =
            type === "forget-password"
              ? "Your Qentrah password reset code"
              : "Your Qentrah verification code";
          const intro =
            type === "forget-password"
              ? "Use this code to reset your Qentrah password."
              : "Use this code to verify your Qentrah account.";

          await resend.sendEmail(requireRunMutationCtx(ctx), {
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
      }),
      organization({
        sendInvitationEmail: async ({ invitation, inviter, organization }) => {
          const invitationId =
            invitation.id || (invitation as { _id?: string })._id;
          if (!invitationId) {
            throw new Error(
              "Invitation email could not be sent because the invitation id is missing.",
            );
          }

          const inviteUrl = `${getAppUrl()}/en/accept-invite?invitationId=${encodeURIComponent(invitationId)}`;
          const invitedBy =
            inviter.user.name || inviter.user.email || "A teammate";

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
      jwt(),
      expo(),
      i18n({
        defaultLocale: "en",
        localeCookie: "NEXT_LOCALE",
        detection: ["session", "cookie", "header"],
        translations: {
          ar: {
            USER_NOT_FOUND: "تعذر العثور على المستخدم",
            INVALID_EMAIL_OR_PASSWORD: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            INVALID_PASSWORD: "كلمة المرور غير صحيحة",
            CREDENTIAL_ACCOUNT_NOT_FOUND: "تعذر العثور على حساب تسجيل الدخول",
            EMAIL_NOT_VERIFIED: "يجب التحقق من البريد الإلكتروني",
            SESSION_EXPIRED: "انتهت جلسة تسجيل الدخول",
          },
        },
      }),
      lastLoginMethod({ storeInDatabase: true }),
      oauthProvider({
        loginPage: "/en/sign-in",
        consentPage: "/oauth/consent",
        validAudiences: [mcpResource],
        scopes: ["openid", "profile", "email", "offline_access", "mcp:read", "mcp:write"],
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
        accessTokenExpiresIn: 60 * 60,
        refreshTokenExpiresIn: 90 * 24 * 60 * 60,
        rateLimit: {
          token: { window: 60, max: 20 },
          authorize: { window: 60, max: 20 },
          introspect: { window: 60, max: 60 },
          revoke: { window: 60, max: 20 },
          register: { window: 60, max: 5 },
          userinfo: { window: 60, max: 30 },
        },
        silenceWarnings: { oauthAuthServerConfig: true },
        clientRegistrationDefaultScopes: ["openid", "profile", "email", "mcp:read"],
        clientRegistrationAllowedScopes: ["offline_access", "mcp:write"],
        selectAccount: {
          page: "/oauth/select-organization",
          shouldRedirect: () => true,
        },
        postLogin: {
          page: "/oauth/select-organization",
          shouldRedirect: ({ session }) =>
            typeof session.activeOrganizationId !== "string" ||
            session.activeOrganizationId.length === 0,
          consentReferenceId: ({ session }) =>
            typeof session.activeOrganizationId === "string"
              ? session.activeOrganizationId
              : undefined,
        },
        customAccessTokenClaims: ({ referenceId }) =>
          referenceId ? { org_id: referenceId } : {},
      }),
      convex({ authConfig }),
    ],

    baseURL: process.env.NEXT_PUBLIC_APP_URL!,
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!, "qentrah://", "qentrah://*"],
    trustedProxyHeaders: true,
    advanced: {
      database: {
        generateId: false,
      },
    },
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
