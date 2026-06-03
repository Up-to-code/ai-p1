import { Hono } from "hono";
import { workosRuntimeConfig } from "@/packages/config";
import { completeMobileOAuth, safeMobileReturnTo, startMobileOAuth } from "./mobile-oauth";
import {
  confirmMobileEmailVerification,
  confirmMobilePasswordReset,
  mobileAuthErrorMessage,
  mobileEmailVerificationChallenge,
  mobileOAuthErrorMessage,
  registerWithMobilePassword,
  requestMobilePasswordReset,
  signInWithMobilePassword,
} from "./mobile-password";

type PasswordLoginBody = {
  email?: unknown;
  password?: unknown;
};

type PasswordRegisterBody = PasswordLoginBody & {
  name?: unknown;
};

type PasswordResetBody = {
  email?: unknown;
};

type PasswordResetConfirmBody = {
  newPassword?: unknown;
  token?: unknown;
};

type EmailVerificationBody = {
  code?: unknown;
  pendingAuthenticationToken?: unknown;
};

type OAuthCompleteBody = {
  code?: unknown;
  codeVerifier?: unknown;
};

export const workosMobileAuthRouter = new Hono();

function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

async function jsonBody<TBody>(request: Request) {
  return await request.json().catch(() => ({})) as TBody;
}

function workosApiOrigin() {
  try {
    return new URL(workosRuntimeConfig.apiBaseUrl).origin;
  } catch {
    return "https://api.workos.com";
  }
}

function isWorkOSAuthorizationUrl(value: string) {
  try {
    const url = new URL(value);
    return url.origin === workosApiOrigin() && url.pathname === "/user_management/authorize";
  } catch {
    return false;
  }
}

function mobileAuthorizationRedirectUrl(requestUrl: string, authorizationUrl: string) {
  const url = new URL(requestUrl);
  url.pathname = "/api/auth/workos/mobile/authorize";
  url.search = "";
  url.hash = "";
  url.searchParams.set("to", authorizationUrl);
  return url.toString();
}

workosMobileAuthRouter.get("/start", async (c) => {
  const url = new URL(c.req.url);

  try {
    const auth = await startMobileOAuth({
      organizationId: url.searchParams.get("organization_id") ?? undefined,
      loginHint: url.searchParams.get("login_hint") ?? undefined,
      provider: url.searchParams.get("provider"),
      returnTo: url.searchParams.get("return_to"),
      screenHint: url.searchParams.get("screen_hint") === "sign-up" ? "sign-up" : "sign-in",
    });

    return c.json({
      ok: true,
      url: mobileAuthorizationRedirectUrl(c.req.url, auth.url),
      state: auth.state,
      codeVerifier: auth.codeVerifier,
    });
  } catch (error) {
    return c.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Qentrah sign-in could not start."),
      returnTo: safeMobileReturnTo(url.searchParams.get("return_to")),
    }, 400);
  }
});

workosMobileAuthRouter.get("/authorize", (c) => {
  const url = new URL(c.req.url);
  const authorizationUrl = url.searchParams.get("to") ?? "";
  if (!isWorkOSAuthorizationUrl(authorizationUrl)) {
    return c.json({
      ok: false,
      error: "Qentrah sign-in could not start.",
    }, 400);
  }

  return c.redirect(authorizationUrl);
});

workosMobileAuthRouter.post("/complete", async (c) => {
  const body = await jsonBody<OAuthCompleteBody>(c.req.raw);

  try {
    const tokens = await completeMobileOAuth({
      code: body.code,
      codeVerifier: body.codeVerifier,
      ipAddress: clientIp(c.req.raw.headers),
      userAgent: c.req.header("user-agent") ?? undefined,
    });
    return c.json({ ok: true, ...tokens });
  } catch (error) {
    const emailVerification = mobileEmailVerificationChallenge(error);
    if (emailVerification) {
      return c.json({ ok: false, emailVerification }, 409);
    }
    return c.json({
      ok: false,
      error: mobileOAuthErrorMessage(error, "Qentrah sign-in callback failed."),
    }, 400);
  }
});

workosMobileAuthRouter.post("/password/login", async (c) => {
  const body = await jsonBody<PasswordLoginBody>(c.req.raw);

  try {
    const session = await signInWithMobilePassword({
      email: body.email,
      password: body.password,
      ipAddress: clientIp(c.req.raw.headers),
      userAgent: c.req.header("user-agent") ?? undefined,
    });
    return c.json({ ok: true, session });
  } catch (error) {
    const emailVerification = mobileEmailVerificationChallenge(error);
    if (emailVerification) {
      return c.json({ ok: false, emailVerification }, 409);
    }
    return c.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Qentrah password sign in failed."),
    }, 400);
  }
});

workosMobileAuthRouter.post("/password/register", async (c) => {
  const body = await jsonBody<PasswordRegisterBody>(c.req.raw);

  try {
    const session = await registerWithMobilePassword({
      email: body.email,
      password: body.password,
      name: body.name,
      ipAddress: clientIp(c.req.raw.headers),
      userAgent: c.req.header("user-agent") ?? undefined,
    });
    return c.json({ ok: true, session });
  } catch (error) {
    const emailVerification = mobileEmailVerificationChallenge(error);
    if (emailVerification) {
      return c.json({ ok: false, emailVerification }, 409);
    }
    return c.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Qentrah password registration failed."),
    }, 400);
  }
});

workosMobileAuthRouter.post("/password/reset", async (c) => {
  const body = await jsonBody<PasswordResetBody>(c.req.raw);

  try {
    await requestMobilePasswordReset({ email: body.email });
    return c.json({ ok: true });
  } catch (error) {
    return c.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Password reset could not be sent."),
    }, 400);
  }
});

workosMobileAuthRouter.post("/password/reset/confirm", async (c) => {
  const body = await jsonBody<PasswordResetConfirmBody>(c.req.raw);

  try {
    await confirmMobilePasswordReset({
      token: body.token,
      newPassword: body.newPassword,
    });
    return c.json({ ok: true });
  } catch (error) {
    return c.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Password reset could not be completed."),
    }, 400);
  }
});

workosMobileAuthRouter.post("/password/verify-email", async (c) => {
  const body = await jsonBody<EmailVerificationBody>(c.req.raw);

  try {
    const session = await confirmMobileEmailVerification({
      code: body.code,
      pendingAuthenticationToken: body.pendingAuthenticationToken,
      ipAddress: clientIp(c.req.raw.headers),
      userAgent: c.req.header("user-agent") ?? undefined,
    });
    return c.json({ ok: true, session });
  } catch (error) {
    return c.json({
      ok: false,
      error: mobileAuthErrorMessage(error, "Email verification could not be completed."),
    }, 400);
  }
});
