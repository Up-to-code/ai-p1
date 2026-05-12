# Better Auth

Purpose: Explains Better Auth installation and Convex integration.

## Scope

This folder owns small, focused documentation files for better auth.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Installation](installation.md) | Install better-auth, @better-auth/oauth-provider, @convex-dev/better-auth, and convex pinned to approved versions. |
| [Convex Integration](convex-integration.md) | Register Better Auth component in convex.config.ts. |
| [Route Registration](route-registration.md) | Register Better Auth HTTP routes lazily. |
| [Session Handling](session-handling.md) | Better Auth owns sessions. |

## Read Order

1. [Installation](installation.md)
2. [Convex Integration](convex-integration.md)
3. [Route Registration](route-registration.md)
4. [Session Handling](session-handling.md)

## Related Domains

- [Auth](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
