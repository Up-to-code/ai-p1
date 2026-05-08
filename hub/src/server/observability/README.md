# Observability

## Purpose
Backend observability boundary for errors, events, metrics, tracing, logs, health, bandwidth, request tracking, and checker tracking.

## What Belongs Here
- Vendor-neutral event and tracking contracts
- Future metrics, trace, health, and log emitters
- Redaction and sampling guidance

## What Must Not Live Here
- Vendor SDK initialization
- Secrets, tokens, cookies, raw request bodies, or sensitive headers
- Domain business logic
- Cross-domain internals

## Public Export Expectations
Export only explicit contracts or stable composition entrypoints. Empty `index.ts` files are allowed during initialization.

## Agent And Programmer Rules
- Observability payloads must be safe to store outside the request path.
- Error events should carry stable codes, safe metadata, and correlation ids.
- Request and checker tracking should use sanitized context only.
- Prefer domain-owned events over shared catch-all event names.
- When implementation begins, use one function per file.
- Do not add real behavior in this initialization pass.

## Future Implementation Notes
Add implementation files only after an observability provider or in-house sink is selected.
