# @anan/auth-sdk

Production authentication SDK for Anan apps. The SDK is an umbrella over the existing Better Auth, OIDC, external authorization, and resource authorization surfaces.

## Security Model

- Browser access tokens are held in memory only.
- Refresh/session continuity is handled by server routes backed by secure Better Auth cookies.
- CSRF tokens are required for refresh calls.
- Refreshes are single-flight, timeout-bound, and scheduled before expiry.
- Raw refresh tokens are never exposed to React components.

## Import Surfaces

```ts
import { createAuthBrowserClient } from "@anan/auth-sdk/client";
import { AuthProvider, useAuth } from "@anan/auth-sdk/react";
import { requireAuthContext } from "@anan/auth-sdk/server";
import { requireEntitlement } from "@anan/auth-sdk/authorization";
```
