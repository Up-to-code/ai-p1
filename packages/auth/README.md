# @anan/auth

Shared OAuth2/OpenID Connect helpers for Anan apps.

This package owns the stable Anan auth API surface:

- Better Auth OIDC provider configuration
- OAuth scope and organization API permission catalogs
- token claim projection into `AuthContext`
- resource-server access token verification
- app-side authorization-code + PKCE helpers
- React auth context helpers

The package intentionally hides provider-library details so apps import
`@anan/auth/server`, `@anan/auth/client`, `@anan/auth/resource-server`, or
`@anan/auth/scopes` instead of reaching into Convex or Better Auth internals.
