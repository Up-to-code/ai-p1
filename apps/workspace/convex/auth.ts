import { expo } from "@better-auth/expo";
import { i18n } from "@better-auth/i18n";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { lastLoginMethod } from "better-auth/plugins";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import authConfig from "./auth.config";
import {
  getAuthUser as getBetterAuthUser,
  safeGetAuthUser as safeGetBetterAuthUser,
} from "./betterAuth";
import { betterAuthClient } from "./betterAuth";
import { createEmailAndPasswordOptions, createEmailOtpPlugin } from "./auth/email";
import { createOrganizationPlugin } from "./auth/organization";
import { createAccessTokenJwtPlugin, createMcpOAuthPlugin } from "./auth/oauth";
import {
  AUTH_JWT_ALGORITHM,
  asBetterAuthAdapterContext,
  resolveBetterAuthRuntime,
  resolveSocialProviders,
  type BetterAuthRuntimeContext,
} from "./auth/runtime";

/**
 * Compose the Better Auth server while keeping provider-specific behavior in
 * focused auth Modules. This remains the single runtime Interface used by the
 * Convex HTTP Adapter and authenticated domain functions.
 */
export const createAuth = (ctx: BetterAuthRuntimeContext) => {
  const runtime = resolveBetterAuthRuntime();

  return betterAuth({
    database: betterAuthClient.adapter(asBetterAuthAdapterContext(ctx)),
    emailAndPassword: createEmailAndPasswordOptions(ctx),
    socialProviders: resolveSocialProviders(),
    plugins: [
      createEmailOtpPlugin(ctx),
      createOrganizationPlugin(ctx, runtime.workspaceOrigin),
      createAccessTokenJwtPlugin(),
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
      createMcpOAuthPlugin(runtime.mcpResourceUrl),
      convex({
        authConfig,
        // Production may still have an EdDSA key from the pre-RS256 setup.
        // Rotate it once when token generation detects the incompatible key.
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
    baseURL: runtime.workspaceOrigin,
    trustedOrigins: runtime.trustedOrigins,
    trustedProxyHeaders: true,
    advanced: {
      database: {
        generateId: false,
      },
    },
    secret: process.env.BETTER_AUTH_SECRET!,
  });
};

/** Required authenticated identity for Convex domain Adapters. */
export async function getAuthUser(ctx: BetterAuthRuntimeContext) {
  return getBetterAuthUser(asBetterAuthAdapterContext(ctx));
}

/** Optional authenticated identity for public or mixed-access Adapters. */
export async function safeGetAuthUser(ctx: BetterAuthRuntimeContext) {
  return safeGetBetterAuthUser(asBetterAuthAdapterContext(ctx));
}

/** Rotate Better Auth signing keys through the Convex-owned JWT Adapter. */
export const rotateKeys = internalAction({
  args: {},
  returns: v.object({
    rotated: v.boolean(),
    algorithm: v.literal(AUTH_JWT_ALGORITHM),
  }),
  handler: async (ctx) => {
    await createAuth(ctx).api.rotateKeys();
    return { rotated: true, algorithm: AUTH_JWT_ALGORITHM };
  },
});
