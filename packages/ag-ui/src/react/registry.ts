import type { AgUiCardComponentProps, AgUiRendererOverrides, AgUiRegisteredComponent } from "../protocol";
import {
  AgApprovalFooter,
  AgAreaHeatCard,
  AgConstraintSummary,
  AgDataList,
  AgExecutionResultCard,
  AgFieldRequestList,
  AgFilterSummary,
  AgLatestUpdateCard,
  AgMarketInsightCard,
  AgMissingDataPrompt,
  AgOfferPublishDraft,
  AgOfferSendDraft,
  AgPersonRelationCard,
  AgProjectCreateDraft,
  AgProjectUnitSelector,
  AgTargetSummary,
  AgThreadUpdateCard,
} from "../cards";

export const AG_UI_COMPONENT_REGISTRY: Record<string, AgUiRegisteredComponent> = {
  project_create_draft: AgProjectCreateDraft as AgUiRegisteredComponent,
  offer_publish_draft: AgOfferPublishDraft as AgUiRegisteredComponent,
  offer_send_draft: AgOfferSendDraft as AgUiRegisteredComponent,
  thread_update: AgThreadUpdateCard as AgUiRegisteredComponent,
  project_unit_selector: AgProjectUnitSelector as AgUiRegisteredComponent,
  person_relation: AgPersonRelationCard as AgUiRegisteredComponent,
  approval_footer: AgApprovalFooter as AgUiRegisteredComponent,
  execution_result: AgExecutionResultCard as AgUiRegisteredComponent,
  field_request_list: AgFieldRequestList as AgUiRegisteredComponent,
  latest_update: AgLatestUpdateCard as AgUiRegisteredComponent,
  market_insight: AgMarketInsightCard as AgUiRegisteredComponent,
  area_heat: AgAreaHeatCard as AgUiRegisteredComponent,
  constraint_summary: AgConstraintSummary as AgUiRegisteredComponent,
  missing_data_prompt: AgMissingDataPrompt as AgUiRegisteredComponent,
  data_list: AgDataList as AgUiRegisteredComponent,
  filter_summary: AgFilterSummary as AgUiRegisteredComponent,
  target_summary: AgTargetSummary as AgUiRegisteredComponent,
};

export const DEFAULT_AG_UI_COMPONENT_REGISTRY = AG_UI_COMPONENT_REGISTRY;

/**
 * WHY:   Hosts should be able to replace specific AG UI cards without forking the default package registry.
 * WHAT:  Returns a merged registry that applies renderer overrides on top of the package defaults.
 * HOW:   Spreads the default registry first, then overlays any supplied component overrides by component id.
 */
export function mergeAgUiComponentRegistry(overrides: AgUiRendererOverrides = {}) {
  return {
    ...AG_UI_COMPONENT_REGISTRY,
    ...overrides,
  };
}

/**
 * WHY:   Consumers often want an explicit factory name when building a registry for renderer usage or docs examples.
 * WHAT:  Creates the concrete registry used by the AG UI renderer.
 * HOW:   Delegates to the shared merge helper so the behavior stays identical across package entrypoints.
 */
export function createAgUiComponentRegistry(overrides: AgUiRendererOverrides = {}) {
  return mergeAgUiComponentRegistry(overrides);
}

export type { AgUiCardComponentProps };
