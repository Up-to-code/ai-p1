# Risks

| Risk | Mitigation |
|---|---|
| Google/Apple OAuth credentials needed | Get from Google Cloud Console / Apple Developer |
| Schema migration — `authTables` from `@convex-dev/better-auth` | `authTables` adds new tables; existing tables untouched. Run `convex codegen` after |
| Email sending not wired | Wire Resend for password reset + invitation emails in Wave 1 |
| `organizationInviteLinks` Convex table | Keep as-is; custom invite links call `auth.api.inviteMember` server-side after token validation |
| Request-context leakage | `AsyncLocalStorage` is exercised with isolation tests and cleared after each operation. |
| Missing Convex token | Protected Convex functions remain fail-closed; server callers do not synthesize actor claims. |
| MCP OAuth metadata drift | Metadata and grant behavior are owned by the MCP OAuth lifecycle and issue #24. |
| Convex resolves workspace packages through built `dist` exports | Convex runtime Adapters that must hot-reload a pure policy import its source module directly; package consumers continue using the public package export. Convex runtime preparation verifies the source import remains bundle-safe. |
| Legacy EdDSA JWKS conflicts with the RS256 Convex provider | Keep OAuth/session JWT generation aligned on RS256, enable temporary automatic mismatch rotation, and expose only the internal operator action for a one-time pre-session rotation. Rotation invalidates outstanding JWTs but not Better Auth sessions; clients mint a replacement token from the existing session. |
| Key rotation maintenance output exposes private key material | The internal action discards the provider's key record and returns only a non-sensitive rotation acknowledgement and algorithm. |
