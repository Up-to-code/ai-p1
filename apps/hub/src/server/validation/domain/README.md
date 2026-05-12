# Validation / Domain

## Purpose
Namespace for rare cross-cutting backend validation contracts.

## What Belongs Here
- Shared validation primitives that cannot be owned by one backend domain.
- Adapter-level validation notes that remain domain-neutral.

## What Must Not Live Here
- Action-specific schemas.
- Large centralized schema files.
- Frontend form schemas.

## Public Export Expectations
Prefer `src/server/domains/<domain>/validation`. Exports here must be intentionally shared.

## Agent And Programmer Rules
- Keep validation close to the action it protects.
- Do not create all-in-one schema files.
- One future schema or schema family per file.

## Future Implementation Notes
Only promote schemas here after at least two domains need the exact same contract.
