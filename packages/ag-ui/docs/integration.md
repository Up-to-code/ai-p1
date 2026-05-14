# Integration Guide

## Use inside this repo

Add path or workspace resolution for:

- `@qentrah/ag-ui`
- `@qentrah/ag-ui/react`
- `@qentrah/ag-ui/qentrah`

In `apps/web`, import the package directly:

```ts
import type { AgUiConversationTurn } from "@qentrah/ag-ui";
import { AgUiTurnRenderer } from "@qentrah/ag-ui/react";
import { AgPropertyForm } from "@qentrah/ag-ui/qentrah";
```

## Use in a fresh Next app

1. Install the package and peer dependencies.
2. Render `AgUiTurnRenderer` inside a client boundary.
3. Provide your own `AgUiConversationTurn` payloads from your agent/backend layer.
4. Optionally override card ids with your own components.
5. Wire action callbacks with `actionHandlers`.

## Host responsibilities

- Build or receive valid turn payloads
- Persist conversations if needed
- Execute mutations, API requests, or navigation on approve/edit
- Override cards when your product needs a different visual language

## When to use the Qentrah adapter

Use `@qentrah/ag-ui/qentrah` only when you need the current Qentrah workspace-specific adapters. Other projects should stay on the generic entrypoints unless they intentionally mirror the Qentrah form workflow.
