# Permissions / Policies

## Purpose
Domain-local policies boundary for permissions.

## What Belongs Here
- Domain-owned contracts
- Future one-file-per-function implementation files
- Subdomain folders where the behavior is narrower than the parent domain

## What Must Not Live Here
- Other domain internals
- Generic shared helpers
- Credentials
- Large mixed-purpose files

## Public Export Expectations
Export through the domain root only. Nested files are private unless re-exported by `../index.ts` intentionally.

## Agent And Programmer Rules
- Keep ownership local.
- Name files after the single action, policy, schema, type, or service they represent.
- Document any cross-domain dependency before adding it.

## Future Implementation Notes
Add concrete files here only when a feature request names this domain responsibility.
