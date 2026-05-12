# API Reference

## `@anan/ag-ui`

Exports:

- `AgUiActionDefinition`
- `AgUiDraftState`
- `AgUiExecutionState`
- `AgUiComponentId`
- `AgUiCardDefinition`
- `AgUiConversationTurn`
- `AgUiActionHandler`
- `AgUiActionHandlers`
- `AgUiRendererOverrides`
- `agUiConversationTurnSchema`
- `agUiCardDefinitionSchema`
- `agUiActionDefinitionSchema`
- `resolveAgUiTurn`
- Default card components
- Registry helpers re-exported from `src/react/registry`

## `@anan/ag-ui/react`

Exports:

- `AgUiTurnRenderer`
- `AG_UI_COMPONENT_REGISTRY`
- `DEFAULT_AG_UI_COMPONENT_REGISTRY`
- `mergeAgUiComponentRegistry`
- `createAgUiComponentRegistry`

### `AgUiTurnRenderer` props

- `turn: AgUiConversationTurn`
- `className?: string`
- `components?: AgUiRendererOverrides`
- `actionHandlers?: AgUiActionHandlers`

### Action handler resolution order

1. `byActionAndName["<actionId>:<actionName>"]`
2. `byName[actionName]`
3. `byActionId[actionId]`
4. `onAction`

## `@anan/ag-ui/anan`

Exports:

- `AgPropertyForm`
- `ProjectFormData`
- `AgRichTextEditor`
- `AgDeleteConfirmModal`

These exports are intentionally adapter-scoped and may depend on Anan workspace infrastructure.
