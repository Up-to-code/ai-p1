# Teams / Invitations

## Purpose
Subdomain boundary for teams invitations.

## What Belongs Here
- Narrow subdomain contracts
- Future action-specific files
- Local README guidance for implementers and agents

## What Must Not Live Here
- Parent-domain catch-all logic
- Unrelated subdomain behavior
- Cross-domain internals

## Public Export Expectations
Re-export through the parent domain only when another layer truly needs the contract.

## Agent And Programmer Rules
- Keep the subdomain focused.
- Prefer explicit names such as create, list, check, assign, revoke, sync, or audit.
- Do not collapse multiple actions into one file.

## Future Implementation Notes
Use this folder when implementation needs a precise ownership boundary inside the domain.
