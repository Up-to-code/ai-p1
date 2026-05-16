# Changes

## 2026-05-16

- Created lifecycle folder for the `improve-codebase-architecture` Convex Adapter type Seam candidate.
- Scope is limited to touched partner/security paths and shared Adapter helper tests.
- Added `createConvexHttpCalls` to `@qentrah/convex-adapters`.
- Added Workspace `convexCalls` and converted touched partner/security service calls to the typed Adapter.
- Added shared Adapter tests and ran package typecheck successfully.
- Added the missing Workspace Turbopack/TypeScript path alias for `@qentrah/platform-core/convex-api` so `@qentrah/convex-adapters` source imports resolve during Vercel production builds.
