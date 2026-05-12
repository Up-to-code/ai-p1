# Types / Domain

## Purpose
Namespace for rare cross-cutting backend domain types.

## What Belongs Here
- Shared backend type aliases that multiple domains truly own together.
- Compatibility types for adapters that cannot belong to one domain.

## What Must Not Live Here
- All domain types by default.
- Frontend types.
- Persistence models before a data-source decision exists.

## Public Export Expectations
Prefer domain-local `types/` folders. Exports here must stay provider-neutral.

## Agent And Programmer Rules
- Add a README note before creating a shared type.
- Keep one future type family per file.
- Avoid broad files named `common`.

## Future Implementation Notes
Use this namespace sparingly after domain boundaries are proven.
