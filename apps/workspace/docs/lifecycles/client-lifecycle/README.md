# Client Lifecycle

Purpose: own Client create, patch, soft-delete, PII protection, audit, and webhook invariants behind one Convex transaction Interface.

Invariants:

- Every record belongs to one Organization and cross-Organization IDs fail closed.
- Create applies owner, pipeline, source, visibility, and lifecycle defaults once.
- Update accepts writable patches; omitted fields, especially encrypted PII, remain unchanged.
- Delete is soft and repeated deletion cannot duplicate audit or webhook effects.
- Hono, MCP, Eve, and internal callers execute the same lifecycle functions.

Public Interface: `createClient`, `updateClient`, and `deleteClient` in `convex/clients/lifecycle.ts`. Convex exports in `write.ts` are authorization and transport adapters.

Authorization scope: public mutations derive the Better Auth actor and assert the Organization Client capability. Internal adapters receive a server-derived actor from scoped MCP execution.

Failure modes: unauthenticated actor, denied capability, tenant mismatch, missing/deleted Client, invalid create input, empty/unknown/immutable patch.
