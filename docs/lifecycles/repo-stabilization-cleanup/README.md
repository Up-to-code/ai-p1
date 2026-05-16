# Repo Stabilization Cleanup

## Purpose

This lifecycle tracks cleanup of the current dirty tree so feature work, dependency drift, generated churn, local config, and dead compatibility code stay reviewable.

## Owner

- Whole monorepo cleanup lifecycle.
- Connected lifecycles remain authoritative for their domains: partner authorization, data security, Convex adapter type seam, and API runtime services.

## Entrypoints

- `git status --short`
- Package manifests and lockfile
- App server/API routes in Workspace, Partners, and Admin
- Lifecycle docs under `docs/lifecycles/`

## Current Status

The repo has broad uncommitted work. Cleanup must use targeted edits only. Do not use destructive git commands or broad formatters.
