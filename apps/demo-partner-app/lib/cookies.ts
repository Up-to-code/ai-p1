export const gateCookieName = "anan_demo_gate";
export const oauthStateCookieName = "anan_oauth_state";
export const pkceVerifierCookieName = "anan_pkce_verifier";
export const tokenCookieName = "anan_demo_tokens";

export const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
