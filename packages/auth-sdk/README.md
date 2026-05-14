# @qentrah/auth-sdk

Production authentication SDK for Qentrah apps. The SDK is an umbrella over the existing Better Auth, OIDC, external authorization, and resource authorization surfaces.

## Security Model

- Browser access tokens are held in memory only.
- Refresh/session continuity is handled by server routes backed by secure Better Auth cookies.
- CSRF tokens are required for refresh calls.
- Refreshes are single-flight, timeout-bound, and scheduled before expiry.
- Raw refresh tokens are never exposed to React components.

## Import Surfaces

```ts
import { createAuthBrowserClient } from "@qentrah/auth-sdk/client";
import { AuthProvider, useAuth } from "@qentrah/auth-sdk/react";
import { requireAuthContext } from "@qentrah/auth-sdk/server";
import { requireEntitlement } from "@qentrah/auth-sdk/authorization";
```
