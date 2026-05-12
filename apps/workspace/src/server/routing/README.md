# Routing

## Purpose
Backend routing boundary for the Hono server architecture.

## What Belongs Here
- Placeholder contracts
- README guidance
- Future one-file-per-function implementation units

## What Must Not Live Here
- Business logic before the domain contract exists
- Cross-domain internals
- Credentials or provider secrets

## Public Export Expectations
Export only explicit contracts or stable composition entrypoints. Empty `index.ts` files are allowed during initialization.

## Agent And Programmer Rules
- Keep files small and intention-revealing.
- Prefer domain-owned folders over shared catch-all files.
- Do not add real behavior in this initialization pass.

## Future Implementation Notes
Add implementation files only when a specific backend feature is requested and its domain owner is clear.
