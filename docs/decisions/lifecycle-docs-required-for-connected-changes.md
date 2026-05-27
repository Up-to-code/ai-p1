# ADR: Lifecycle Docs Are Required For Connected Changes

## Status

Accepted

## Context

Qentrah has cross-app workflows where changing one function can break authorization, schema compatibility, service tokens, data retention, or admin review behavior elsewhere.

## Decision

Any connected change to functions, APIs, routes, Convex functions, auth, env/secrets, schemas, migrations, partner flows, admin/workspace/partners behavior, or lifecycle software must inspect or update `docs/lifecycles/<slug>/` before implementation.

## Consequences

- Lifecycle folders are dependency maps, not replacements for tests.
- Architecture RFCs must name the lifecycle folder that owns each proposed refactor.
- Future agents should use `lifecycle-guard` together with architecture skills before touching connected code.
