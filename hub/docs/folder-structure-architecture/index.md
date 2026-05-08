# Folder Structure Architecture

Purpose: Defines the business documentation folder architecture for the Saudi Arabia Central Real Estate Data Hub.

This documentation domain explains how the documentation is arranged, why each folder exists, how the folders work together, and how the Convex database model fits the business architecture. It is planning and infrastructure documentation only. It does not create application code, database code, UI code, or implementation files.

## Scope

This domain owns the folder-level architecture for business, system, Convex DB, workflow, and governance documentation.

This domain does not own detailed schema rules, OAuth behavior, SDK implementation, frontend design, or compliance interpretation. Those details remain in their owning domains and are linked from here.

## Files

| Folder | Purpose |
| --- | --- |
| [Business Context](business-context/index.md) | Explains the region, market, actors, regulatory posture, and business reason for the hub. |
| [Platform Boundary](platform-boundary/index.md) | Explains what the hub is, what it is not, and why the documentation must protect that boundary. |
| [Convex DB](convex-db/index.md) | Explains the business architecture of the Convex database without defining code. |
| [Domain Folders](domain-folders/index.md) | Explains the existing documentation domains and why responsibilities are separated. |
| [Workflows](workflows/index.md) | Explains the business workflows that connect ingestion, approval, visibility, and distribution. |
| [Governance](governance/index.md) | Explains ownership, maintenance, change control, and documentation quality rules. |

## Read Order

1. [Business Context](business-context/index.md)
2. [Platform Boundary](platform-boundary/index.md)
3. [Convex DB](convex-db/index.md)
4. [Domain Folders](domain-folders/index.md)
5. [Workflows](workflows/index.md)
6. [Governance](governance/index.md)

## Architecture Principles

- The documentation must describe the hub as a Saudi Arabia Central Real Estate Data Hub.
- The documentation must preserve the product boundary: synchronization engine, OAuth 2.1 Provider, canonical data layer, and distribution layer.
- The documentation must not drift into CRM, marketplace, advertising portal, lead pipeline, or deal pipeline scope.
- The documentation must separate business reasoning from implementation details.
- The documentation must link to owning domains instead of copying full specifications.
- The documentation must be small enough that each folder can be read, reviewed, and maintained independently.

## How This Domain Works

This domain is a map of the documentation system. A reader starts here when they need to understand why the project is split into many folders and how those folders should be used together.

For example, this domain explains that Convex DB has business responsibilities such as canonical property identity, submission history, visibility decisions, audit evidence, and integration records. The detailed table responsibilities still live in [Data Model](../data-model/index.md), and Convex-specific runtime boundaries still live in [Architecture / Convex](../architecture/convex/index.md).

## Related Domains

- [Root Documentation](../README.md)
- [Architecture](../architecture/index.md)
- [Data Model](../data-model/index.md)
- [Synchronization](../synchronization/index.md)
- [Visibility](../visibility/index.md)
- [Auth](../auth/index.md)
- [Compliance](../compliance/index.md)
- [Security](../security/index.md)
- [Guidelines](../guidelines/index.md)

## Maintenance Rules

- Every folder in this domain must contain an `index.md`.
- Keep this domain documentation-only.
- Update this index whenever a folder is added, removed, renamed, or re-scoped.
- Link to the owning domain when a topic needs detail.
- Keep folder names lowercase kebab-case.
- Preserve the Saudi market and synchronization-engine boundary.
