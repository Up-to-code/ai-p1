<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

<!-- modalization-pattern-start -->

# Modalization Pattern

When implementing complex forms or configuration panels, use the **modalization pattern**:

## Principles

1. **Separate modals for separate concerns**: Each complex configuration or form should have its own dedicated modal component, not inline panels within the parent component.

2. **Shared components**: Create reusable modal components that can be imported and used across different parts of the application.

3. **Clean separation**: The parent component manages the modal state (open/close) and passes data to/from the modal via props.

## Example: Custom Fields Modal

```tsx
// custom-fields-modal.tsx - Dedicated modal component
export function CustomFieldsModal({
  open,
  onOpenChange,
  customFields,
  onSave,
}: CustomFieldsModalProps) {
  const [fields, setFields] = useState<CustomField[]>(customFields);

  const handleSave = () => {
    onSave(fields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom Fields</DialogTitle>
        </DialogHeader>
        {/* Form content */}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Fields</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Parent component usage
function DocEditor({ doc, ... }) {
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowCustomFieldsModal(true)}>
        Custom Fields
      </Button>

      <CustomFieldsModal
        open={showCustomFieldsModal}
        onOpenChange={setShowCustomFieldsModal}
        customFields={draft.customFields || []}
        onSave={(fields) => updateDraft({ customFields: fields })}
      />
    </div>
  );
}
```

## Benefits

- **Modularity**: Each modal is self-contained and can be tested independently
- **Reusability**: Modal components can be reused in different contexts
- **Maintainability**: Easier to update and maintain isolated modal logic
- **UX**: Cleaner UI with proper modal animations and backdrop handling
- **Accessibility**: Better focus management and keyboard navigation

## When to Use

Use modalization for:
- Complex forms with multiple fields
- Configuration panels (e.g., custom fields, settings)
- Multi-step wizards
- Any UI that requires focused attention

<!-- modalization-pattern-end -->
