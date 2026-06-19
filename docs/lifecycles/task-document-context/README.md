# Task Document Context

Purpose: keep task detail documents, project-scoped task routing, contextual mentions, uploads, and task quick actions aligned.

Owner app: `apps/workspace`.

Entrypoints:
- Global tasks: `apps/workspace/src/app/[locale]/(app)/tasks/page.tsx`
- Task detail: `apps/workspace/src/app/[locale]/(app)/tasks/[id]/page.tsx`
- Project tasks: `apps/workspace/src/app/[locale]/(app)/projects/[projectId]/tasks/page.tsx`
- Shared screen/editor: `apps/workspace/src/domains/tasks/components/tasks-screen.tsx`, `apps/workspace/src/components/shared/work-os-doc-editor.tsx`

Current status: active. Task documents now need to preserve whether the user is working globally or inside a project so routing, mentions, quick actions, and future linked resources do not accidentally cross project boundaries.
