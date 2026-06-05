# Utils / Routing

## Purpose
Domain-neutral backend utility boundary for routing.

## What Belongs Here
- Type-only contracts
- Placeholder policy shapes
- Future one-function-per-file helpers
- README guidance for safe enterprise implementation

## What Must Not Live Here
- Domain business logic
- Hono route handlers
- Provider SDK wiring
- Secrets, allowlists, credentials, database, Convex, Auth0, or dev identity implementation

## Public Export Expectations
Export type contracts and stable utility entrypoints only. During initialization, empty exports are acceptable.

## Agent And Programmer Rules
- Keep utilities domain-neutral.
- One future function per file.
- Do not throw from checker helpers by default; return typed decisions.
- Do not read full request bodies by default in future loader/bandwidth helpers.

## Future Implementation Notes
Implement only after the calling middleware/domain has a clear contract and test scenario.
