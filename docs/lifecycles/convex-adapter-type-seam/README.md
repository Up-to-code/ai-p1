# Convex Adapter Type Seam

Purpose: keep generated Convex function-reference details and cast-heavy fetch helpers local to shared Adapters so Workspace domain Modules can use smaller typed Interfaces.

Owner app/package: `packages/convex-adapters` owns the shared Adapter helpers. Workspace domain services consume them when calling Convex from server runtimes.

Entrypoints:
- `packages/convex-adapters/src/repository.ts`
- Workspace server-domain services that call Convex HTTP helpers.
- Generated Convex function references in `apps/workspace/convex/_generated`.

Current status: active architecture cleanup lifecycle. The first pass should only improve touched partner/security paths and must not attempt a whole-repo Convex Adapter rewrite.
