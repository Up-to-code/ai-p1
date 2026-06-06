# Brand Assets

This folder is the source of truth for Qentrah brand artwork.

Edit files in `source/`, then run:

```bash
npm run brand:assets
```

The sync script generates app-specific outputs for mobile, web, desktop, workspace, marketing, partners, admin, and demo surfaces.

## Source Files

- `source/app-icon-mobile.png`: master mobile app icon artwork.
- `source/brand-mark.png`: standalone brand mark for raster mobile use.
- `source/brand-mark.svg`: standalone brand mark for vector mobile use.
- `source/brand-logo.svg`: full logo for light surfaces.
- `source/brand-logo-white.svg`: full logo for dark surfaces.
- `source/mobile-splash-light.png`: mobile splash mark for light mode.
- `source/mobile-splash-dark.png`: mobile splash mark for dark mode.

## Generated Policy

Mobile app icons keep the source artwork directly. Desktop and web icons use the same artwork with platform-safe inset padding so the mark does not fill the macOS Dock or Windows tile.
