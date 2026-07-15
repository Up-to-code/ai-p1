# Distribution Assets

The tracked `source/` directory contains the Qentrah logo used by unmodified source builds. The artwork is publicly visible but is not licensed under BSL; its use is governed by `TRADEMARKS.md` and `source/LICENSE`.

The tracked `community/` directory contains neutral replacement artwork for forks and modified distributions.

Run:

```bash
npm run brand:assets
```

The sync script generates Qentrah-branded app-specific outputs for mobile, web, desktop, Workspace, Marketing, and partner surfaces by default.

## Alternative assets

Set `QENTRAH_BRAND_ASSET_DIR` to a directory containing:

- `app-icon.svg` or `app-icon-mobile.png`
- `brand-mark.svg`
- `brand-logo.svg`
- `brand-logo-white.svg`

Forks can point this variable at `packages/brand-identity/assets/community`. Official release automation may point it at a private directory containing higher-resolution or release-only masters.

The override is validated before any output is written. Release-only masters must not be copied into this repository. The project-license check allows approved Qentrah logo fingerprints only at canonical source and generated runtime paths.

Modified distributions and forks must supply their own artwork and comply with `TRADEMARKS.md`.
