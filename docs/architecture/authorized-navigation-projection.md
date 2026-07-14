# Authorized Navigation Projection Module

## Purpose

The Authorized Navigation Projection Module hides domain availability, live
Organization permissions, role defaults, user personalization, catalog
reconciliation, and layout persistence behind one actor-specific Interface.

## Public Interface

- `getAuthorizedProjection(organizationId)` returns only readable implemented
  domains, canonical route and icon IDs, effective labels, rail mode, and
  secondary-panel width.
- `updateMyOverlay(organizationId, input)` updates the authenticated user's
  order, aliases, optional hidden nodes, rail mode, or secondary-panel width.
- `updateOrganizationLayout(organizationId, roleKey, input)` updates an
  administrator-owned default and writes an Organization audit event.
- Unknown domain IDs and aliases are discarded. Newly implemented readable
  domains are appended in canonical product order.

## Invariants

- React never receives domains it cannot read.
- Layout configuration cannot alter canonical route IDs, icon IDs, or access.
- Personal aliases override Organization aliases; personal order takes
  precedence and Organization order fills omitted domains.
- Required domains cannot be hidden.
- Preferences follow the authenticated user across devices.
- Infrastructure without a real route and domain owner is absent from the
  implemented catalog.

## Adapters

- Convex Adapter derives the actor, evaluates live Organization permissions,
  reads/writes layouts, and builds the projection.
- Workspace sidebar Adapter maps semantic routes and icons to localized React
  rendering. It owns only transient open/close and pointer-drag state.

## Dependencies

The Module calls Workspace Identity, Organization permissions, the canonical
route catalog, and localization. It does not query domain records or authorize
leaf resources.

## Authorization Scope

Projection reads and personal overlay writes require current Organization read
access. Organization layout writes require Organization update access. Actors
are derived from Better Auth through the Convex access Adapter.

## Failure Modes

Missing membership fails closed before layout data is returned. Unknown stored
IDs are ignored. Preference write failures retain the last server projection
and are logged by the Workspace Adapter. Layout writes are atomic within
Convex; no partial external operation exists.

## Verification

Projection tests cover omission, overlay precedence, catalog evolution, width,
and layout version. Route tests cover canonical and legacy aliases. Sidebar
source tests cover localization, server-synced width, semantic routes, and the
absence of the deleted client manifest.

## Deletion Test

Deleting this Module would force every rendered client and future mobile
Adapter to reproduce permission filtering, role defaults, overlay merge,
catalog evolution, and persistence. The Module therefore provides both
leverage and locality.
