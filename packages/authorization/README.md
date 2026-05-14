# @anan/authorization

TypeScript SDK for connecting external applications to Qentrah organization data using Authorization Code + PKCE.

```ts
import { createQentrahAuthorizationClient, exchangeCode } from "@anan/authorization";

const anan = createQentrahAuthorizationClient({
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

The SDK opens Qentrah's branded consent popup, validates the returned `state`, and falls back to redirect when popups are unavailable. Confidential clients must exchange codes on a trusted server.
