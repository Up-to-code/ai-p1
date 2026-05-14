# @qentrah/auth

Shared OAuth2/OpenID Connect helpers for Qentrah apps.

This package owns the stable Qentrah auth API surface:

- Better Auth OIDC provider configuration
- OAuth scope and organization API permission catalogs
- token claim projection into `AuthContext`
- resource-server access token verification
- app-side authorization-code + PKCE helpers
- React auth context helpers

The package intentionally hides provider-library details so apps import
`@qentrah/auth/server`, `@qentrah/auth/client`, `@qentrah/auth/resource-server`, or
`@qentrah/auth/scopes` instead of reaching into Convex or Better Auth internals.
