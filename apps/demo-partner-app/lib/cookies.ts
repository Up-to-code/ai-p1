export const gateCookieName = "qentrah_demo_gate";
export const oauthStateCookieName = "qentrah_oauth_state";
export const pkceVerifierCookieName = "qentrah_pkce_verifier";
export const tokenCookieName = "qentrah_demo_tokens";

export const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
