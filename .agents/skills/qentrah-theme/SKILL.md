# Qentrah Theme System

Source-of-truth files:
- `design-system.json` — design tokens (colors, spacing, radius, shadows)
- `ui.json` — shadcn/ui theme variables with light/dark values
- `apps/workspace/src/app/globals.css` — CSS variables (`--q-*`) for web
- `apps/marketing/app/globals.css` — same for marketing site
- `apps/mobile/src/foundation/theme/tokens.ts` — mobile theme tokens
- `apps/mobile/src/foundation/theme/ThemeProvider.tsx` — mobile theme provider

## Cardinal Rules

### 1. No hardcoded hex colors in components
Every color must come from:
- **Web**: `var(--q-*)` CSS variable, or a Tailwind utility that maps to one
- **Mobile**: `colors.*` from `useTheme()` hook, or import from `tokens.ts`

### 2. Dark mode text-on-accent must always be tested
`--q-accent` in dark mode = `#F5F2EC` (warm off-white).  
**`#FFFFFF` text/icons on `--q-accent` background are invisible in dark mode.**  
Use `--q-accent-foreground` (dark = `#080808`/`#111111`) or `colors.background` instead of hardcoded `#FFFFFF`.

### 3. Dark mode detection
Use `resolvedColorScheme` from `useTheme()` (mobile) or `.dark` class (web).  
Never detect dark mode by comparing `colors.background === "#000000"` — the background value may change.

### 4. Light/dark hierarchy

**Dark mode** (deepest → highest):
```
Level 0:  #000000 (mobile) / #080808 (web)  — base page bg
Level 1:  #111111  — secondary bg, cards, dialogs, inputs
Level 2:  #1C1C1C  — surface/card content bg
Level 3:  #222222  — sidebar, raised/hover states
Level 4:  #2A2A2A  — accent-muted, sidebar-accent
Borders:  #222222 (subtle) / #2A2A2A (strong)
Text:     #F5F2EC (primary) / #BFB8AE (secondary) / #8A857E (muted)
Accent:   #F5F2EC (on dark surfaces)
```

**Light mode** (the warm reverse):
```
Level 0:  #FAF8F4  — base page bg
Level 1:  #F5F2EC  — sidebar, secondary bg
Level 2:  #FFFFFF  — surface, cards, inputs
Level 3:  #EAE6DF  — accent-muted, sidebar-accent
Borders:  #DED8CF (subtle) / #D5CEC4 (strong)
Text:     #111111 (primary) / #4D4D4D (secondary) / #787878 (muted)
Accent:   #111111 (on light surfaces)
```

### 5. Sidebar must be distinguishable from page background
- **Light**: sidebar `#F5F2EC` on bg `#FAF8F4` — sufficient contrast
- **Dark**: sidebar `#222222` on bg `#080808`/`#000000` — sufficient contrast

### 6. Mobile: `card` token for dialogs/sheets
The `card` property exists on both `darkColors` and `lightColors`. Bottom sheets, modals, and dialogs should use `colors.card` for their surface background.

### 7. `text-white` on `bg-primary`/`bg-foreground` in dark mode
In dark mode `--primary` = `--q-accent` = `#F5F2EC`.  
`text-white` on `bg-primary` is invisible. Always use:
- `bg-primary text-primary-foreground` (properly paired)
- Or add `dark:text-foreground dark:bg-white` overrides

### 8. Workspace: use shadcn/ui semantic pairs
Prefer pairs like `bg-card text-card-foreground`, `bg-muted text-muted-foreground`, `bg-primary text-primary-foreground` over hardcoded color utilities.

### 9. No Tailwind blue-* utility classes for brand colors
Brand colors are the warm palette (`#111111`, `#F5F2EC`, `#FAF8F4`, etc.).  
Blue `#3b82f6` / `#2563eb` / `#0b5cff` is the old brand. Use domain colors from `--q-*`:
- `#4F80FF` (q-network-blue)
- `#8A5CFF` (q-agent-purple)
- `#2BB673` (q-human-green)

## Quick Reference

| Token | Light | Dark |
|-------|-------|------|
| `--q-bg` | `#FAF8F4` | `#080808` |
| `--q-bg-secondary` | `#F5F2EC` | `#111111` |
| `--q-sidebar` | `#F5F2EC` | `#222222` |
| `--q-surface` | `#FFFFFF` | `#1C1C1C` |
| `--q-card` | `#FFFFFF` | `#111111` |
| `--q-topbar` | `#FAF8F4` | `#080808` |
| `--q-accent` | `#111111` | `#F5F2EC` |
| `--q-accent-foreground` | `#FFFFFF` | `#080808` |
| `--q-text-primary` | `#111111` | `#F5F2EC` |
| `--q-border` | `#DED8CF` | `#222222` |
