# @qentrah/svar-ui-components

Shareable, customizable view components using @svar-ui libraries (Calendar, Gantt, Kanban, File Manager) with Qentrah theming and unified architecture.

## Overview

This package provides unified UI components for the Qentrah platform, integrating @svar-ui libraries with Qentrah's design system. All components support domain-specific configuration via props and integrate with the view configuration system for persistent user preferences.

## Installation

```bash
npm install @qentrah/svar-ui-components
```

## Components

### Modal System

Size variants: small (30%), medium (70%), large (90%), fullscreen.

```tsx
import { QentrahModal, QentrahDialog } from '@qentrah/svar-ui-components/modals';

<QentrahModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Task"
  size="medium"
>
  <YourForm />
</QentrahModal>
```

### Calendar

Apple-style calendar with day/week/month views.

```tsx
import { QentrahCalendar } from '@qentrah/svar-ui-components/calendar';

<QentrahCalendar
  events={events}
  view="month"
  onEventClick={(event) => console.log(event)}
  onEventCreate={(start, end) => console.log(start, end)}
/>
```

### Kanban Board

Drag-and-drop kanban with column customization.

```tsx
import { QentrahKanban } from '@qentrah/svar-ui-components/kanban';

<QentrahKanban
  columns={columns}
  onCardMove={(cardId, from, to) => console.log(cardId, from, to)}
  onCardClick={(card) => console.log(card)}
  showColumnColors
/>
```

### Gantt Chart

Project timeline with task dependencies.

```tsx
import { QentrahGantt } from '@qentrah/svar-ui-components/gantt';

<QentrahGantt
  tasks={tasks}
  links={links}
  scale="week"
  onTaskUpdate={(taskId, updates) => console.log(taskId, updates)}
/>
```

### File Manager

Document browsing with grid/list/tree views.

```tsx
import { QentrahFileManager } from '@qentrah/svar-ui-components/filemanager';

<QentrahFileManager
  items={items}
  view="grid"
  onFileUpload={(file) => console.log(file)}
  onItemClick={(item) => console.log(item)}
/>
```

### Table with Views

Enhanced table with view configuration integration.

```tsx
import { QentrahTableWithViews } from '@qentrah/svar-ui-components/grid';

<QentrahTableWithViews
  rows={rows}
  columns={columns}
  viewConfig={viewConfig}
  onViewConfigChange={(config) => console.log(config)}
/>
```

## Theme Integration

All components use the Qentrah theme system with CSS variables.

```tsx
import { QentrahThemeProvider, injectQentrahThemeVars } from '@qentrah/svar-ui-components/theme';

// Call once in your app root
injectQentrahThemeVars();

// Wrap your app
<QentrahThemeProvider>
  <YourApp />
</QentrahThemeProvider>
```

## View Configuration System

The package includes hooks for managing persistent view configurations.

```tsx
import { useViewConfig } from '@qentrah/svar-ui-components/hooks';

const { viewConfigs, activeView, saveView, updateView } = useViewConfig({
  organizationId,
  domain: 'projects',
  spaceId,
  projectId,
  userId,
});
```

## Domain Examples

### Projects Domain

```tsx
import { ProjectViews } from '@qentrah/svar-ui-components/examples';

<ProjectViews
  tasks={tasks}
  view="board"
  onTaskUpdate={(taskId, updates) => updateTask(taskId, updates)}
  onTaskClick={(task) => openTaskModal(task)}
/>
```

### Clients Domain

```tsx
import { ClientViews } from '@qentrah/svar-ui-components/examples';

<ClientViews
  clients={clients}
  view="board"
  onClientUpdate={(clientId, updates) => updateClient(clientId, updates)}
  onClientClick={(client) => openClientModal(client)}
/>
```

## Convex Integration

The view configuration system requires Convex schema changes:

```typescript
// convex/schema/views.ts
export const viewTables = {
  views: defineTable({
    organizationId: v.string(),
    domain: v.string(),
    spaceId: v.optional(v.id("spaces")),
    projectId: v.optional(v.id("projects")),
    userId: v.string(),
    viewConfig: v.object({ /* ... */ }),
    // ...
  }),
  workspaceSettings: defineTable({
    organizationId: v.string(),
    viewScope: v.union(v.literal("space"), v.literal("project"), v.literal("workspace")),
    // ...
  }),
};
```

Add to main schema:

```typescript
import { viewTables } from "./schema/views";

export default defineSchema({
  // ... other tables
  ...viewTables,
});
```

## API Reference

### QentrahModal

- `isOpen`: boolean - Modal visibility
- `onClose`: () => void - Close handler
- `title`: string - Modal title
- `size`: 'small' | 'medium' | 'large' | 'fullscreen'
- `showCloseButton`: boolean
- `closeOnBackdropClick`: boolean
- `closeOnEscape`: boolean

### QentrahCalendar

- `events`: CalendarEvent[]
- `view`: 'day' | 'week' | 'month'
- `currentDate`: Date
- `onEventClick`: (event) => void
- `onEventCreate`: (start, end) => void
- `onEventUpdate`: (event) => void

### QentrahKanban

- `columns`: KanbanColumn[]
- `onCardMove`: (cardId, from, to) => void
- `onCardUpdate`: (cardId, updates) => void
- `onCardClick`: (card) => void
- `showColumnColors`: boolean

### QentrahGantt

- `tasks`: GanttTask[]
- `links`: GanttLink[]
- `scale`: 'day' | 'week' | 'month' | 'sprint'
- `onTaskUpdate`: (taskId, updates) => void
- `onTaskClick`: (task) => void

### QentrahFileManager

- `items`: FileManagerItem[]
- `view`: 'grid' | 'list' | 'tree'
- `onFileUpload`: (file) => void
- `onFileDelete`: (itemId) => void
- `onItemClick`: (item) => void

## Development

```bash
# Build
npm run build

# Test
npm run test
```

## Notes

- Components use placeholder implementations for @svar-ui libraries. Full integration pending library availability.
- Kanban uses trial version initially; will migrate to full release when available.
- Theme variables are injected via `injectQentrahThemeVars()` in your app root.
- View configurations are persisted per-space by default, configurable to per-project/workspace.

## License

Private - Qentrah Internal Use Only
