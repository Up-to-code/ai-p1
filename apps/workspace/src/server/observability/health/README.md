# Observability / Health

## Purpose
Vendor-neutral observability boundary for health.

## What Belongs Here
- Event contracts
- Metric/tracing/logging shapes
- Future adapters after a provider is selected

## What Must Not Live Here
- Vendor SDK initialization
- Secrets, tokens, DSNs, API keys
- Raw request bodies, cookies, authorization headers, or sensitive payload logging

## Public Export Expectations
Export sanitized event/metric/log contracts only.

## Agent And Programmer Rules
- Never log secrets or sensitive request bodies.
- Prefer structured events over strings.
- Keep tracking separate from business decisions.

## Future Implementation Notes
Provider adapters can be added behind these contracts after security and retention requirements are defined.
