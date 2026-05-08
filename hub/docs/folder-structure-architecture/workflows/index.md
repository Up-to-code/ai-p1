# Workflows

Purpose: Explains the business workflows that connect documentation folders and Convex DB responsibility zones.

## Scope

This folder owns workflow-level documentation for planning and folder architecture.

This folder does not own implementation logic, API code, UI flows, or detailed state machines.

## Files

| File | Purpose |
| --- | --- |
| `index.md` | Explains the business workflows that connect documentation domains. |

## Core Workflow

The hub workflow is claim to canonical state to distribution.

1. External platform submits a claim.
2. Hub validates payload and organization context.
3. Hub normalizes the claim into submission state.
4. Reviewer approves, rejects, or escalates.
5. Approved submission affects canonical state.
6. Visibility model computes what can be seen.
7. Distribution sends approved state to connected systems.
8. Audit records preserve the decision trail.

## Folder-To-Workflow Map

| Workflow Step | Folder To Read |
| --- | --- |
| Submission enters the hub | [Synchronization / Ingestion](../../synchronization/ingestion/index.md) |
| Payload is validated | [Developer Experience / API](../../developer-experience/api/index.md) and [Data Model / Submission](../../data-model/submission/index.md) |
| Review decision is made | [Synchronization / Approval](../../synchronization/approval/index.md) |
| Canonical state changes | [Architecture / Data Flow](../../architecture/data-flow/index.md) and [Data Model](../../data-model/index.md) |
| Visibility is computed | [Visibility / Model](../../visibility/model/index.md) |
| Data is distributed | [Synchronization / Distribution](../../synchronization/distribution/index.md) |
| Evidence is retained | [Compliance / Audit](../../compliance/audit/index.md) and [Data Model / Audit](../../data-model/audit/index.md) |

## Why Workflow Documentation Matters

Folder architecture is useful only when it matches how the business actually operates. Workflows connect the folders so a reader can move from strategic planning into the right detailed documentation.

For example, if a platform asks why a listing disappeared, the answer may require visibility rules, approval state, Ejar rental status, distribution logs, and audit records. The workflow documentation tells the reader where to go first and how to follow the trail.

## Workflow Boundaries

Workflows must stay inside the hub boundary. They may describe data intake, review, approval, visibility, distribution, and audit. They must not describe sales pipeline management, buyer matching, marketing campaigns, broker commissions, or marketplace ranking.

## Read With

- [Architecture / Data Flow](../../architecture/data-flow/index.md)
- [Synchronization](../../synchronization/index.md)
- [Visibility](../../visibility/index.md)
- [Data Model / Audit](../../data-model/audit/index.md)
- [Compliance / Audit](../../compliance/audit/index.md)

## Maintenance Rules

- Keep workflow descriptions business-level.
- Link each step to its owning documentation domain.
- Update this folder when the core claim-to-distribution lifecycle changes.
- Do not add implementation code or pseudo-code here.
