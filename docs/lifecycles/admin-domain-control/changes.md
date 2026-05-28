# Changes

## 2026-05-28 Admin Source Adapter Depth

- Added `apps/admin/src/lib/admin-domain-sources.ts` as the Admin app source Adapter Module for local security, Partners, and Workspace Convex reads/actions.
- Kept Admin Hono routes and Admin domain service responses stable while concentrating configured-source selection behind one Interface.

## 2026-05-28 Domain Adapter Depth

- Recorded the Workspace admin control surface lifecycle.
- Extracted switch-heavy Workspace admin domain behavior into `convex/admin/domainAdapters.ts`.
- Added `convex/admin/listSurface.ts` so the domain Adapter registry no longer owns pagination bounds, bounded-search warnings, search matching, or mapped page response shaping inline.
- Added `convex/admin/organizationDashboard.ts` so organization dashboard member discovery and actionable notification projection have a focused Module and test surface.
- Kept `admin:listDomain`, `admin:getDomainRecord`, and `admin:runDomainAction` exported Convex function names stable as a facade over the Adapter registry.
- Preserved read-only domain errors, partner catalog source-of-truth errors, status transition behavior, summaries, detail dashboards, and audit recording.
