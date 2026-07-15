# @qentrah/brand-identity

Shared brand identity configuration for app display names, route slugs, env
prefixes, domains, color tokens, and distribution asset sources.

Edit `src/index.ts`, then run `npm run brand:sync` for static metadata that cannot import TypeScript directly.

The tracked Qentrah logo source is in `assets/source/`; run
`npm run brand:assets` to regenerate source-build assets. The logo files remain
outside the BSL grant and are governed by `TRADEMARKS.md` and the asset-local
license. Forks can use the neutral artwork in `assets/community/` by setting
`QENTRAH_BRAND_ASSET_DIR` to that directory before generation.

Official release automation may still supply higher-resolution or release-only
masters through `QENTRAH_BRAND_ASSET_DIR`.
