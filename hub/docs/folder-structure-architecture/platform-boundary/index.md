# Platform Boundary

Purpose: Explains what the hub is, what it is not, and how folder structure protects that boundary.

## Scope

This folder owns the documentation boundary at the business architecture level.

This folder does not own detailed frontend, backend, API, SDK, or schema implementation rules.

## Files

| File | Purpose |
| --- | --- |
| `index.md` | Explains the hub boundary and how documentation folders prevent scope drift. |

## What The Hub Is

The hub is a Saudi Arabia Central Real Estate Data Hub. It behaves as:

- a synchronization engine;
- an OAuth 2.1 Provider for connected platforms;
- a canonical property and project data layer;
- a visibility decision layer;
- an audit and evidence layer;
- a distribution layer for approved state.

## What The Hub Is Not

The hub is not:

- a CRM;
- a public marketplace;
- a listing website;
- a lead pipeline;
- a deal pipeline;
- a broker inbox;
- a consumer search product;
- a document-signing product.

## Why The Boundary Matters

The folder structure prevents scope drift. If every new idea has a clear owning folder, the project can reject misplaced behavior early.

For example, a document about OAuth client credentials belongs under [Auth](../../auth/index.md), while a document about connected platform onboarding belongs under [Developer Experience](../../developer-experience/index.md). A document about buyer leads should not be added because buyer pipeline behavior is outside the hub boundary.

## Folder Boundary Rules

| Topic | Owning Documentation Area |
| --- | --- |
| System structure | [Architecture](../../architecture/index.md) |
| Convex DB table responsibilities | [Data Model](../../data-model/index.md) |
| OAuth, sessions, scopes, credentials | [Auth](../../auth/index.md) |
| External claim lifecycle | [Synchronization](../../synchronization/index.md) |
| Visibility decisions | [Visibility](../../visibility/index.md) |
| Saudi regulatory context | [Compliance](../../compliance/index.md) |
| API and webhook safety | [Security](../../security/index.md) |
| External developer setup | [Developer Experience](../../developer-experience/index.md) |
| SDK packaging and examples | [SDK](../../sdk/index.md) |
| Documentation policy | [Guidelines](../../guidelines/index.md) |

## How This Folder Works

Use this folder when planning new documentation. Before creating a new file, decide whether the idea belongs inside the hub boundary and which existing domain owns the detail.

If the idea crosses multiple areas, create a short orientation document here and link to the owning domains. Do not create a large duplicate specification.

## Read With

- [Architecture / Product Boundary](../../architecture/overview/product-boundary.md)
- [Guidelines / Documentation Structure](../../guidelines/documentation-structure.md)
- [Root Documentation](../../README.md)

## Maintenance Rules

- Preserve the synchronization-engine boundary.
- Reject CRM, marketplace, lead, and deal pipeline scope.
- Link to owning domains instead of duplicating behavior.
- Update this folder when the platform scope changes.
