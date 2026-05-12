# Interfaces / Domain

## Purpose
Namespace for rare cross-cutting backend domain interfaces.

## What Belongs Here
- Adapter-facing interfaces that are shared by multiple backend domains.
- Documentation explaining why an interface is not owned by one domain.

## What Must Not Live Here
- Default domain interfaces.
- UI props.
- Provider-specific or database-specific models.

## Public Export Expectations
Prefer each domain's `interfaces/` folder. Re-export from here only when the contract is intentionally cross-domain.

## Agent And Programmer Rules
- Do not use this as a dumping ground.
- Keep ownership clear before adding a file.
- One future interface family per file.

## Future Implementation Notes
Move contracts back into a domain if ownership becomes clear later.
