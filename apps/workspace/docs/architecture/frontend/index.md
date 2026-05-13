# Frontend

Purpose: Explains frontend architecture using Next.js App Router, ShadCN/UI, Tailwind CSS, Lucide React, and Convex realtime data.

## Scope

This folder owns small, focused documentation files for frontend.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [App Router](app-router.md) | Use Next.js 16.2.4 App Router. |
| [Page Shell](page-shell.md) | Use one workspace shell for sidebar, topbar, organization selector, and content region. |
| [Realtime Ui](realtime-ui.md) | Use Convex reactive queries for submissions, properties, sync events, and audit state. |
| [Shadcn Usage](shadcn-usage.md) | Use official ShadCN/UI primitives. |

## Read Order

1. [App Router](app-router.md)
2. [Page Shell](page-shell.md)
3. [Realtime Ui](realtime-ui.md)
4. [Shadcn Usage](shadcn-usage.md)

## Related Domains

- [Architecture](../index.md)
- [Guidelines](../../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
