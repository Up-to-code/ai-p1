# CRUD Service Factory

## Purpose
Eliminate 6 copy-pasted CRUD service files by providing a single `createCrudService()` factory that generates `create`/`update`/`remove` functions from Convex API references.

## Owner
`apps/workspace/src/server/utils/service-factory.ts`

## Pattern
Each domain defines its own service file that:
1. Imports Convex API references
2. Optionally defines a `toConvexInput` transformer (for Id-casting)
3. Calls `createCrudService({ api, idParamName, toConvexInput })`
4. Exports the resulting functions under domain-specific names

## Domains using factory
- clients, clientTasks, clientFollowUps, deals, opportunities, projects

## Domains NOT using factory (kept custom)
- calendar (date/time math in toConvexInput)
- media (external UploadThing deletion in deleteMedia)
- billing (multi-step DodoPayments orchestration)
- agents/* (tool execution, streaming, confirmations)
- partnerApps (external API verification)
- organization/* (Clerk API integration, access policies, audit logging)
