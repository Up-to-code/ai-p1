# Risks

- Generated Convex references are app-local. The shared package must not import Workspace generated files.
- A broad rewrite would create review noise and risk unrelated regressions.
- Typed helpers must not pretend to validate runtime payloads; Convex validators remain the runtime source of truth.
