# Server Backend Architecture

## Purpose
Owns the Hono backend architecture for the hub application. The Next app may host the adapter, but server routing, access, validation, protocols, and domain orchestration live here.

## What Belongs Here
- Hono app composition
- Backend domain contracts
- Middleware boundaries
- Auth and authorization architecture
- Protocol readiness such as MCP
- Shared backend-only types and utilities

## What Must Not Live Here
- React components
- Client Zustand stores
- Next.js route-handler business logic
- Convex runtime implementation
- Secrets, credentials, tokens, or live provider configuration

## Public Export Expectations
Only stable backend entrypoints should be exported from this tree. Domains export public contracts through their own `index.ts` files; consumers must not import domain internals.

## Agent And Programmer Rules
- Keep Hono as the only API router.
- Keep Next API files as adapters only.
- Keep one future function per file.
- Keep validation, types, interfaces, and policies scoped to their domain or subdomain.
- Do not mix domain ownership.

## Future Implementation Notes
When implementation begins, add route registration through `routing/`, then delegate to domain handlers, services, validators, policies, and audit contracts.
