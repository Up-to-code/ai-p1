# Qentrah Domain Context

## Core Concepts

- **Organization** — top-level tenant. All data belongs to an organization.
- **Space** — a grouping of projects within a workspace. Has a slug and optional icon.
- **Project** — a container for tasks, docs, calendar events, and team collaboration.
- **Task** — a unit of work with status, priority, assignee, pipeline order, tags, and custom fields.
- **Client** — a CRM entity tracked through pipeline stages (new, contacted, qualified, proposal, negotiation, closedWon, closedLost).
- **Deal** — a sales opportunity with amount, stage, and expected close date.
- **Calendar** — events and task due dates in a month-grid layout.
- **Workspace** — the unified UI layer combining sidebar rail, topbar, and content views.

## Deepened Modules

- **Task Mutation** — `domains/tasks/hooks/use-task-mutations.ts`. Provides `createTask`, `updateTask`, `deleteTask`, `moveTask` with consistent error handling (revert + toast), auto-derives project/space from navigation context, accepts partial changes. Single seam for all task mutations across workspace views.

## Architecture Decisions

See `docs/decisions/` and `docs/lifecycles/` for ADRs and lifecycle documentation.
