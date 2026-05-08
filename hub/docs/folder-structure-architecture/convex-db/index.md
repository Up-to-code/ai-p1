# Convex DB

Purpose: Explains the business folder architecture for Convex database documentation without defining implementation code.

## Scope

This folder owns the business-level view of how Convex DB supports the hub.

This folder does not define schema code, validators, indexes, functions, queries, mutations, or actions. Detailed table responsibilities belong in [Data Model](../../data-model/index.md), and Convex runtime boundaries belong in [Architecture / Convex](../../architecture/convex/index.md).

## Files

| File | Purpose |
| --- | --- |
| `index.md` | Explains Convex DB responsibility zones at the business architecture level. |

## Business Role Of Convex DB

Convex DB is the operational data backbone for the hub. It stores the state needed to receive external claims, make approval decisions, compute visibility, distribute approved data, and preserve audit evidence.

At the business documentation level, Convex DB should be understood as a set of responsibility zones rather than code tables.

## Responsibility Zones

| Zone | Business Responsibility | Owning Detail |
| --- | --- | --- |
| Property identity | Stable canonical identity for properties, units, projects, and location references. | [Data Model / Property](../../data-model/property/index.md) |
| Submission intake | External claims, validation state, rejection reasons, and approval state. | [Data Model / Submission](../../data-model/submission/index.md) |
| Organization context | Publisher profiles, organization membership, and authorization boundaries. | [Data Model / Organizations](../../data-model/organizations/index.md) |
| Integration records | Connected platforms, OAuth clients, API keys, and webhook endpoints. | [Data Model / Integrations](../../data-model/integrations/index.md) |
| Visibility state | Computed visibility, suppression, allowed audiences, and channel controls. | [Data Model / Visibility](../../data-model/visibility/index.md) |
| Audit evidence | Audit logs, integration logs, distribution events, and evidence retention. | [Data Model / Audit](../../data-model/audit/index.md) |
| Schema discipline | Naming, validators, indexes, versioning, and table rules. | [Data Model / Convex Schema](../../data-model/convex-schema/index.md) |

## How Convex DB Works In The Business Architecture

1. A connected platform or publisher submits a claim.
2. The claim is validated and stored as a submission record.
3. Review and approval workflows decide whether the claim can affect canonical state.
4. Approved data updates canonical property, project, unit, or listing state.
5. Visibility rules decide what downstream systems may see.
6. Distribution records track outgoing synchronization.
7. Audit records preserve who changed what, why, when, and through which integration.

## What Must Be Stored Carefully

- Property identifiers and Saudi-specific references.
- Title deed, RER, Ejar, Wafi, and REGA-related references where applicable.
- Publisher and integration ownership boundaries.
- Approval, rejection, validation, and suppression reasons.
- Version history for canonical state.
- Evidence references and audit trail metadata.
- Webhook delivery state and retry outcomes.

## What Must Not Be Treated As Ordinary Data

- Personal data.
- Owner, tenant, or contact identifiers.
- Secrets, tokens, API keys, and client secrets.
- Regulatory evidence.
- Approval decisions.
- Audit logs.

These categories require stricter documentation links to [Security](../../security/index.md), [Auth](../../auth/index.md), and [Compliance](../../compliance/index.md).

## Read With

- [Architecture / Convex](../../architecture/convex/index.md)
- [Data Model](../../data-model/index.md)
- [Synchronization / Engine](../../synchronization/engine/index.md)
- [Visibility / Model](../../visibility/model/index.md)
- [Security / Secrets](../../security/secrets/index.md)

## Maintenance Rules

- Keep this folder business-level.
- Do not add schema code or implementation examples here.
- Link each database responsibility to its owning data-model folder.
- Update this folder when a new database responsibility zone is introduced.
