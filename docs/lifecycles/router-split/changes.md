# Changes

## 2026-06-20 — Split central mega-router into per-domain sub-routers
- Extracted 8 sub-routers from 496-line `router.ts` into `domains/` directory
- Main router reduced to 23 lines (middleware + 8 route mounts)
- Each sub-router imports only its own domain handlers
- Route ordering preserved (root-level routes before parameterized routes)
- Zero external API changes — same route paths, same middleware
