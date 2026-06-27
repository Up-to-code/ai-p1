# Bug Patterns and Prevention Strategies

## Overview

This document documents common bug patterns identified in the Qentrah codebase and provides strategies to prevent them in future development.

## Bug Pattern #1: API Validation Schema Mismatch

### Description
The MCP Task Update Validation bug occurred because the Convex implementation layer used the same validation function for both create and update operations, requiring fields that should be optional during partial updates.

### Root Cause
- Single validation function (`taskInput`) used for both create and update operations
- No separation between create vs update validation schemas
- Backend didn't support partial PATCH-style updates

### Impact
- Breaks PATCH semantics
- Prevents simple task movements between projects
- Forces redundant payload construction
- Increases risk of inconsistent client-side behavior

### Prevention Strategy

**1. Separate Validation Schemas**
```typescript
// Create schema - all required fields
export const taskCreateInputSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["todo", "inProgress", "waiting", "done", "canceled"]),
  // ... other required fields
});

// Update schema - only taskId required, all others optional
export const taskUpdateInputSchema = taskCreateInputSchema.partial().extend({
  taskId: z.string().min(1),
});
```

**2. Separate Processing Functions**
```typescript
// Create function - requires all fields
export function taskInput(input: Input) {
  return {
    title: requiredString(input, "title"),
    status: taskStatus(input),
    // ... other required fields
  };
}

// Update function - merges with existing, only updates provided fields
export function taskUpdateInput(input: Input, existing: Record<string, unknown>) {
  return {
    title: optionalString(input, "title") ?? existing.title,
    status: input.status !== undefined ? taskStatus(input) : existing.status,
    // ... other optional fields with fallbacks
  };
}
```

**3. Implementation Pattern**
```typescript
// In the API handler
if (args.tool === "tasks_create") {
  const taskData = taskInput(input); // Strict validation
  // ... create logic
}

if (args.tool === "tasks_update") {
  const taskId = requiredString(input, "taskId");
  const existing = await ctx.db.get(taskId);
  const patch = taskUpdateInput(input, existing); // Partial update
  // ... update logic
}
```

### Testing Strategy
- Test single-field updates (projectId only, status only)
- Test project reassignment without other fields
- Test partial updates with multiple fields
- Verify no validation errors for missing optional fields
- Test with null values for nullable fields

---

## Bug Pattern #2: React Performance Degradation in Drag-and-Drop

### Description
The Tasks Drag-and-Drop Performance bug caused lag/jank/stuttering when dragging task cards between columns in the Kanban board.

### Root Cause
- Excessive React re-renders during drag operations
- Unstable array references causing unnecessary component updates
- State updates creating new object references on every drag

### Impact
- Poor UX, especially with many cards or lower-end devices
- Delay between mouse/touch movement and card following
- Columns re-rendering excessively during drag
- Dropping cards sometimes feels unresponsive

### Prevention Strategy

**1. Stabilize Array References**
```typescript
// BAD - creates new array every render
const tasks = tasksResult.data ?? [];

// GOOD - use useMemo for stable reference
const tasks = useMemo(() => tasksResult.data ?? [], [tasksResult.data]);
```

**2. Use Reference Comparison**
```typescript
// Compare task IDs instead of array references
const sameIds = (a: Task[], b: Task[]) => {
  if (a.length !== b.length) return false;
  return a.every((task, i) => task._id === b[i]?._id);
};

// Only update reference if order actually changed
const prevTasksRef = useRef<Task[]>([]);
const tasks = useMemo(() => {
  const newTasks = sortPipelineTasks(rawTasks);
  if (sameIds(newTasks, prevTasksRef.current)) {
    return prevTasksRef.current;
  }
  prevTasksRef.current = newTasks;
  return newTasks;
}, [rawTasks]);
```

**3. Optimize Drag-and-Drop Configuration**
```typescript
// Use dragOverlay for smooth preview
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <DragOverlay>
    {activeId ? <TaskCard task={activeTask} /> : null}
  </DragOverlay>
</DndContext>
```

**4. Apply React.memo Strategically**
```typescript
// Memoize card components to prevent unnecessary re-renders
const TaskCard = React.memo(({ task }: { task: Task }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.task._id === nextProps.task._id &&
         prevProps.task.status === nextProps.task.status;
});
```

**5. Minimize State Updates During Drag**
```typescript
// BAD - state update on every drag move
const handleDragMove = (event) => {
  setDragPosition({ x: event.delta.x, y: event.delta.y });
};

// GOOD - only update on drag end
const handleDragEnd = (event) => {
  const { active, over } = event;
  if (over) {
    // Single state update at the end
    moveTask(active.id, over.id);
  }
};
```

### Testing Strategy
- Test with 50+ cards per column
- Profile with React DevTools to identify re-render patterns
- Verify 60fps drag performance
- Test on mobile touch devices
- Check console for React warnings about keys or re-renders

---

## General Prevention Strategies

### 1. API Design Principles

**PATCH Semantics**
- Always support partial updates for update operations
- Only require the ID field for updates
- Use existing values as fallbacks for missing fields
- Document which fields are required vs optional

**Validation Layers**
- Separate validation schemas for create vs update
- Use schema composition (e.g., `.partial()`, `.extend()`)
- Validate at multiple layers (schema, business logic, database)
- Provide clear error messages for validation failures

**Type Safety**
- Use TypeScript strict mode
- Avoid `any` types - use proper type definitions
- Use type guards for runtime validation
- Leverage Zod or similar for runtime type checking

### 2. React Performance Best Practices

**Memoization**
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Use `React.memo` for components that re-render unnecessarily
- Profile before optimizing - don't guess

**Reference Stability**
- Keep array/object references stable when content hasn't changed
- Use reference comparison (`useRef`) to detect actual changes
- Avoid creating new objects in render
- Use immutable update patterns

**State Management**
- Minimize state updates during user interactions
- Batch related state updates
- Use optimistic updates with rollback for better UX
- Consider state management libraries for complex state

### 3. Testing Strategies

**Unit Testing**
- Test validation functions with valid and invalid inputs
- Test edge cases (null, undefined, empty strings)
- Test partial updates with various field combinations
- Mock external dependencies

**Integration Testing**
- Test API endpoints with various payload combinations
- Test error handling and validation error messages
- Test permission checks and authorization
- Test database operations with realistic data

**Performance Testing**
- Profile React components with DevTools
- Test with realistic data volumes (50+ items)
- Test on lower-end devices or network conditions
- Use performance monitoring in production

### 4. Code Review Checklist

**For API Changes**
- [ ] Are create and update validation schemas separate?
- [ ] Do update operations support partial updates?
- [ ] Are nullable fields properly handled?
- [ ] Are error messages clear and actionable?
- [ ] Are permissions properly checked?

**For React Components**
- [ ] Are expensive computations memoized?
- [ ] Are array/object references stable?
- [ ] Are event handlers properly memoized?
- [ ] Have re-renders been profiled?
- [ ] Does drag-and-drop feel smooth?

**For Performance Changes**
- [ ] Was the performance issue measured before fixing?
- [ ] Was the fix verified with profiling?
- [ ] Are there any negative side effects?
- [ ] Is the fix documented?
- [ ] Are there tests to prevent regression?

## Conclusion

By following these patterns and strategies, we can prevent common bugs and maintain high code quality in the Qentrah codebase. Regular code reviews, comprehensive testing, and performance profiling are essential to catch issues early and ensure a smooth user experience.
