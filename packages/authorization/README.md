# @anan/authorization

TypeScript SDK for connecting external applications to Anan organization data using Authorization Code + PKCE.

```ts
import { createAnanAuthorizationClient, exchangeCode } from "@anan/authorization";

const anan = createAnanAuthorizationClient({
  issuer: "https://auth.example.convex.site",
  clientId: "anan_client_...",
  redirectUri: "https://external.example.com/oauth/callback",
  scopes: ["clients:read_own", "offline_access"],
});

const result = await anan.authorize();
await exchangeCode({
  issuer: "https://auth.example.convex.site",
  clientId: "anan_client_...",
  code: result.code,
  redirectUri: result.redirectUri,
  codeVerifier: result.codeVerifier,
});
```

The SDK opens Anan's branded consent popup, validates the returned `state`, and falls back to redirect when popups are unavailable. Confidential clients must exchange codes on a trusted server.
