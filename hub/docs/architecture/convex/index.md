# Convex

Purpose: Explains Convex-specific backend boundaries, queries, mutations, actions, schema, and HTTP routes.

## Scope

This folder owns small, focused documentation files for convex.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Schema Boundaries](schema-boundaries.md) | Better Auth component schema is separate from hub domain schema. |
| [Queries](queries.md) | Queries enforce server-side authorization. |
| [Mutations](mutations.md) | Mutations validate input, enforce permission, modify state, and write audit records where required. |
| [Actions](actions.md) | Actions handle webhooks, official checks, URL probes, and other external I/O. |
| [Http Routes](http-routes.md) | Better Auth routes register through registerRoutesLazy. |

## Read Order

1. [Schema Boundaries](schema-boundaries.md)
2. [Queries](queries.md)
3. [Mutations](mutations.md)
4. [Actions](actions.md)
5. [Http Routes](http-routes.md)

## Related Domains

- [Architecture](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
