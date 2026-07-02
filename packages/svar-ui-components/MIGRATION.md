# Migration Guide

This guide helps you migrate existing UI components to the new @qentrah/svar-ui-components package.

## Calendar Migration

### From Old Calendar

```tsx
// Old implementation
import { OldCalendar } from './old-calendar';

<OldCalendar events={events} />
```

### To New Calendar

```tsx
// New implementation
import { QentrahCalendar } from '@qentrah/svar-ui-components/calendar';

<QentrahCalendar
  events={events.map(e => ({
    id: e.id,
    title: e.title,
    start: new Date(e.start),
    end: new Date(e.end),
    color: e.color,
  }))}
  view="month"
  onEventClick={handleEventClick}
/>
```

## Pipeline Board Migration

### From PipelineBoard

```tsx
// Old implementation
import { PipelineBoard } from '@qentrah/our-platform-components/pipeline';

<PipelineBoard
  columns={columns}
  onCardMove={handleMove}
/>
```

### To QentrahKanban

```tsx
// New implementation
import { QentrahKanban } from '@qentrah/svar-ui-components/kanban';

<QentrahKanban
  columns={columns.map(col => ({
    id: col.id,
    title: col.title,
    color: col.color,
    cards: col.cards.map(card => ({
      id: card.id,
      title: card.title,
      priority: card.priority,
      assignees: card.assignees,
    })),
  }))}
  onCardMove={handleMove}
  showColumnColors
/>
```

## Table Migration

### From QentrahTable

```tsx
// Old implementation
import { QentrahTable } from '@qentrah/ui/qentrah-table';

<QentrahTable
  rows={rows}
  columns={columns}
/>
```

### To QentrahTableWithViews

```tsx
// New implementation
import { QentrahTableWithViews } from '@qentrah/svar-ui-components/grid';

<QentrahTableWithViews
  rows={rows}
  columns={columns}
  viewConfig={viewConfig}
  onViewConfigChange={handleViewConfigChange}
/>
```

## Modal Migration

### From Custom Modals

```tsx
// Old implementation
function CustomModal({ isOpen, onClose, children }) {
  return (
    <div className={isOpen ? 'open' : 'closed'}>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### To QentrahModal

```tsx
// New implementation
import { QentrahModal } from '@qentrah/svar-ui-components/modals';

<QentrahModal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  size="medium"
>
  {children}
</QentrahModal>
```

## Data Transformation Helpers

### Calendar Events

```typescript
function toCalendarEvent(event: OldEvent): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    color: event.color,
    allDay: event.isAllDay,
  };
}
```

### Kanban Cards

```typescript
function toKanbanCard(item: OldItem): KanbanCard {
  return {
    id: item.id,
    title: item.name,
    description: item.description,
    priority: item.priority as KanbanCard['priority'],
    assignees: item.assignedUsers,
    dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
  };
}
```

### Gantt Tasks

```typescript
function toGanttTask(task: OldTask): GanttTask {
  return {
    id: task.id,
    title: task.name,
    start: new Date(task.startDate),
    end: new Date(task.endDate),
    progress: task.completionPercentage,
    priority: task.priority as GanttTask['priority'],
    dependencies: task.dependencyIds,
  };
}
```

## View Configuration Setup

### 1. Add Convex Schema

```typescript
// convex/schema.ts
import { viewTables } from "./schema/views";

export default defineSchema({
  // ... existing tables
  ...viewTables,
});
```

### 2. Initialize View Hook

```tsx
import { useViewConfig } from '@qentrah/svar-ui-components/hooks';

function MyComponent() {
  const { viewConfigs, activeView, saveView } = useViewConfig({
    organizationId,
    domain: 'projects',
    spaceId,
    projectId,
    userId,
  });

  // Use viewConfig in your components
  return (
    <QentrahTableWithViews
      viewConfig={activeView}
      onViewConfigChange={saveView}
      // ...
    />
  );
}
```

## Theme Setup

### 1. Inject Theme Variables

```tsx
// app/layout.tsx or root component
import { injectQentrahThemeVars } from '@qentrah/svar-ui-components/theme';

useEffect(() => {
  injectQentrahThemeVars();
}, []);
```

### 2. Wrap with Theme Provider

```tsx
import { QentrahThemeProvider } from '@qentrah/svar-ui-components/theme';

<QentrahThemeProvider>
  <YourApp />
</QentrahThemeProvider>
```

## Step-by-Step Migration

### Phase 1: Install Package

```bash
npm install @qentrah/svar-ui-components
```

### Phase 2: Add Convex Schema

Add `convex/schema/views.ts` and update `convex/schema.ts`.

### Phase 3: Deploy Schema Changes

```bash
npx convex dev
```

### Phase 4: Migrate One Component at a Time

1. Start with modals (simplest)
2. Then calendar
3. Then kanban/pipeline
4. Then table with views
5. Finally gantt and file manager

### Phase 5: Test Each Migration

- Verify data transformation
- Test event handlers
- Check view persistence
- Validate theme integration

### Phase 6: Remove Old Code

After testing and verification, remove old component implementations.

## Common Issues

### Type Mismatches

If you encounter type errors, use transformation helpers:

```typescript
// Instead of passing raw data
<QentrahKanban columns={rawColumns} />

// Transform first
<QentrahKanban columns={rawColumns.map(transformColumn)} />
```

### Missing Dependencies

Ensure peer dependencies are installed:

```bash
npm install react@^19.0.0 react-dom@^19.0.0
```

### Theme Not Applied

Call `injectQentrahThemeVars()` in your app root before rendering.

### View Config Not Persisting

Verify Convex schema is deployed and mutations are working:

```bash
npx convex dashboard
```

## Rollback Plan

If migration fails, you can rollback by:

1. Revert component imports to old implementations
2. Remove viewTables from Convex schema
3. Deploy schema rollback
4. Remove package installation

## Support

For issues during migration:
- Check this guide first
- Review component API documentation
- Verify Convex schema deployment
- Test with sample data before full migration
