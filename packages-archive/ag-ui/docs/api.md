# API Reference

## `@qentrah/ag-ui`

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

## `@qentrah/ag-ui/react`

Exports:

- `AgUiTurnRenderer`
- `AG_UI_COMPONENT_REGISTRY`
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
