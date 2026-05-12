# Utils

## Purpose
Backend utility contract boundary for reusable, domain-neutral operational helpers.

## What Belongs Here
- Error shape and error tracking contracts
- Logging and request log context contracts
- IP, routing, retry, queue, stack, grid, bandwidth, loader, request, response, cache, and checker boundaries
- Future one-file-per-function implementation units

## What Must Not Live Here
- Domain business logic
- Vendor-specific monitoring, queue, cache, or persistence integrations
- Credentials, secrets, tokens, cookies, or raw request body snapshots
- Cross-domain internals

## Public Export Expectations
Export only explicit type contracts or stable utility entrypoints. Empty `index.ts` files are allowed during initialization.

## Agent And Programmer Rules
- Utilities must stay generic and cannot know business domains.
- Error tracking must be vendor-neutral and redact sensitive request material.
- Retry, queue, and grid files define envelopes and policies only until a worker or scheduler is requested.
- Bandwidth and loader utilities must define safe limits before any future body reads.
- When implementation begins, use one function per file.
- Do not add real behavior in this initialization pass.

## Future Implementation Notes
Add implementation files only when a specific backend feature is requested and its runtime owner is clear.
