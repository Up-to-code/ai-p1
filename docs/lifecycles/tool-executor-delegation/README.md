# Tool-Executor Delegation

## Purpose
Refactor agent tool-executor to delegate CRUD create/delete to domain services instead of duplicating `fetchAuthMutation` calls.

## Owner
`apps/workspace/src/server/domains/agents/services/tool-executor.ts`

## Changes
- Create operations now call `createClient`/`createProject`/`createClientTask` domain services
- Delete operations now call `deleteClient`/`deleteProject`/`deleteClientTask` domain services
- Update operations keep inline merge-and-clean logic (agent-specific input cleaning pattern)
- Read operations unchanged (direct `fetchAuthQuery` calls for list/get)

## Architecture
The tool-executor sits between the LLM and the domain layer:
1. LLM generates tool call with unstructured input
2. Tool-executor cleans input via Zod schemas (`tool-inputs.ts`)
3. For create/delete: delegates to domain services (which use `createCrudService` factory)
4. For update: merges existing record with patch, strips DB fields, validates, then calls service
5. For read: direct Convex query calls (no business logic needed)
