# Changes

## 2026-06-20 — Create CRUD service factory
- Created `src/server/utils/service-factory.ts` with `createCrudService<TInput>()`
- Refactored 6 service files from ~30 lines each of copy-pasted code to ~15 lines using the factory
- Preserved domain-specific naming via re-exports (`createClient = crud.create`)
- Kept `markFollowUpComplete` as an extra domain-specific function in follow-ups service
- All handlers continue importing the same function names — zero handler changes needed
