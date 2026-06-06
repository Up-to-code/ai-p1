import type { AgUiRegisteredComponent, AgUiRendererOverrides } from "./types";
import { AgExecutionResultCard } from "./cards/execution-result-card";

/**
 * Default registry of AG UI components.
 * To be populated as cards are implemented.
 */
const AG_UI_COMPONENT_REGISTRY: Record<string, AgUiRegisteredComponent> = {
  execution_result: AgExecutionResultCard as AgUiRegisteredComponent,
  // project_create_draft: AgProjectCreateDraft as AgUiRegisteredComponent,
  // ...
};

export function mergeAgUiComponentRegistry(overrides: AgUiRendererOverrides = {}) {
  return {
    ...AG_UI_COMPONENT_REGISTRY,
    ...overrides,
  };
}
