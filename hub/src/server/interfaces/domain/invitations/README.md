# Interfaces / Domain / Invitations

## Purpose
Shared backend interfaces namespace reserved for cross-cutting invitations contracts that cannot belong to a single domain subfolder.

## What Belongs Here
- Cross-cutting backend contracts only
- Compatibility or adapter-facing contracts
- Documentation explaining why the contract is not domain-local

## What Must Not Live Here
- Default place for all domain contracts
- UI types
- Database models without a persistence decision

## Public Export Expectations
Prefer domain-local exports first. Use this namespace sparingly and document the reason.

## Agent And Programmer Rules
- Do not use this as a dumping ground.
- If a contract is owned by one domain, keep it in `src/server/domains/<domain>`.
- Cross-cutting contracts must remain provider-neutral.

## Future Implementation Notes
Promote only truly shared contracts here after domain ownership is clear.
