# Business Context

Purpose: Explains the business reason, regional context, and operating assumptions behind the documentation architecture.

## Scope

This folder owns the high-level business context for why the hub exists and why documentation must be structured carefully.

This folder does not own detailed regulatory interpretation, table definitions, API contracts, or product implementation.

## Files

| File | Purpose |
| --- | --- |
| `index.md` | Explains the business and regional context for the documentation architecture. |

## What This Folder Explains

The Saudi Arabia Central Real Estate Data Hub exists to create a disciplined synchronization layer for real estate data. External platforms submit claims. The hub validates, reviews, approves, computes visibility, and distributes authoritative state.

The documentation architecture must reflect that business reality. It must help readers understand the region, the compliance posture, the actor model, and the reason data cannot be treated like ordinary marketplace content.

## Business Drivers

- Saudi real estate data needs traceability, approval, and evidence.
- Property identity must be separated from listing or availability state.
- Regulatory and audit concerns must be visible in the architecture.
- Connected platforms need reliable data without becoming the source of truth.
- Canonical data must support property lifecycle, submissions, visibility, distribution, and audit history.

## Regional Context

The hub is Saudi Arabia-only. Documentation must preserve Saudi-specific concepts such as REGA context, Real Estate Registry references, Ejar rental status, Wafi/off-plan considerations, National Address components, title deed references, and evidence requirements.

This is product and architecture planning, not legal advice. Regulatory statements must be validated against official sources and counsel before production decisions.

## Primary Actors

| Actor | Business Role |
| --- | --- |
| Platform admin | Operates the hub, reviews risk, manages approval and controls. |
| Publisher organization | Submits property, project, unit, listing, and evidence claims. |
| Connected platform | Receives approved data through APIs, webhooks, or feeds. |
| Integration partner | Builds technical connections to the hub. |
| Auditor or observer | Reviews evidence, logs, decisions, and compliance posture. |
| Legal or compliance reviewer | Interprets regulatory risk and approval requirements. |

## Why This Folder Exists

Without this folder, the documentation can become technically correct but strategically confused. This folder keeps the reason for the architecture visible: the hub is not a generic database and not a property website. It is a controlled data infrastructure layer for a specific market.

## Read With

- [Architecture / Overview](../../architecture/overview/index.md)
- [Compliance](../../compliance/index.md)
- [Data Model / Property](../../data-model/property/index.md)
- [Synchronization](../../synchronization/index.md)

## Maintenance Rules

- Keep this folder focused on business context.
- Do not add implementation details here.
- Link to compliance documents for specific regulatory topics.
- Update this folder when the project boundary, market scope, or actor model changes.
