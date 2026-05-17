import { Hono } from "hono";
import { getCurrentPartnerSession } from "@/lib/auth-server";
import { pkceS256, sandboxToken, sha256 } from "./crypto";
import { formValue, json, oauthError, scopesFrom } from "./http";
import { sandboxStore } from "./store";

export const sandboxOAuthApp = new Hono().basePath("/sandbox/oauth");

sandboxOAuthApp.get("/authorize", async (c) => {
  try {
    const token = (await getCurrentPartnerSession(c.req.raw.headers))?.user?.id ?? null;
    const url = new URL(c.req.url);
    const clientId = url.searchParams.get("client_id")?.trim() ?? "";
    const redirectUri = url.searchParams.get("redirect_uri")?.trim() ?? "";
    const responseType = url.searchParams.get("response_type")?.trim() ?? "";
    const state = url.searchParams.get("state")?.trim() ?? "";
    const codeChallenge = url.searchParams.get("code_challenge")?.trim() ?? "";
    const codeChallengeMethod = url.searchParams.get("code_challenge_method")?.trim() ?? "";
    const scopes = scopesFrom(url.searchParams.get("scope") ?? "");

    if (!token) return oauthError("login_required", 401);
    if (responseType !== "code") return oauthError("unsupported_response_type");
    if (!clientId || !redirectUri) return oauthError("invalid_request");
    if (codeChallengeMethod !== "S256" || !codeChallenge) {
      return oauthError("invalid_request", 400, "Sandbox OAuth requires PKCE S256.");
    }

    const result = await sandboxStore.createAuthorizationCode(token, {
      clientId,
      redirectUri,
      scopes,
      codeChallenge,
      codeChallengeMethod: "S256",
    });

    const redirect = new URL(result.redirectUri);
    redirect.searchParams.set("code", result.code);
    redirect.searchParams.set("organization_id", result.organizationId);
    if (state) redirect.searchParams.set("state", state);
    return Response.redirect(redirect, 302);
  } catch (error) {
    return oauthError("invalid_request", 400, error instanceof Error ? error.message : undefined);
  }
});

sandboxOAuthApp.post("/token", async (c) => {
  try {
    const body = new URLSearchParams(await c.req.text());
    const grantType = formValue(body, "grant_type");
    const accessToken = sandboxToken("sandbox_access");
    const refreshToken = sandboxToken("sandbox_refresh");

    if (grantType === "authorization_code") {
      const code = formValue(body, "code");
      const clientId = formValue(body, "client_id");
      const redirectUri = formValue(body, "redirect_uri");
      const codeVerifier = formValue(body, "code_verifier");
      if (!code || !clientId || !redirectUri || !codeVerifier) return oauthError("invalid_request");

      const result = await sandboxStore.exchangeAuthorizationCode({
        code,
        clientId,
        redirectUri,
        codeChallenge: pkceS256(codeVerifier),
        accessTokenHash: sha256(accessToken),
        refreshTokenHash: sha256(refreshToken),
      });

      return json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: result.expiresIn,
        scope: result.scopes.join(" "),
        organization_id: result.organizationId,
        mode: "sandbox",
      });
    }

    if (grantType === "refresh_token") {
      const suppliedRefreshToken = formValue(body, "refresh_token");
      if (!suppliedRefreshToken) return oauthError("invalid_request");
      const result = await sandboxStore.rotateRefreshToken({
        refreshTokenHash: sha256(suppliedRefreshToken),
        accessTokenHash: sha256(accessToken),
        nextRefreshTokenHash: sha256(refreshToken),
      });

      return json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: result.expiresIn,
        scope: result.scopes.join(" "),
        organization_id: result.organizationId,
        mode: "sandbox",
      });
    }

    return oauthError("unsupported_grant_type");
  } catch (error) {
    return oauthError("invalid_grant", 400, error instanceof Error ? error.message : undefined);
  }
});
