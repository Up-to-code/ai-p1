import type { ComponentType } from "react";

export type AgUiComponentId =
  | "project_create_draft"
  | "offer_publish_draft"
  | "offer_send_draft"
  | "thread_update"
  | "project_unit_selector"
  | "person_relation"
  | "approval_footer"
  | "execution_result"
  | "field_request_list"
  | "latest_update"
  | "market_insight"
  | "area_heat"
  | "constraint_summary"
  | "missing_data_prompt"
  | "data_list"
  | "filter_summary"
  | "target_summary";

export type AgUiActionDefinition = {
  id:
    | "create_project"
    | "list_clients"
    | "list_projects"
    | "search_projects"
    | "list_offers"
    | "search_offers"
    | "delete_project_confirmation"
    | "publish_offer"
    | "send_offer"
    | "latest_update"
    | "search_market"
    | "search_project"
    | "search_broker_demand";
  title: string;
  zone: "projects" | "offers" | "crm" | "market";
  fields: string[];
};

export type AgUiExecutionState = "draft" | "collecting" | "ready" | "executing" | "completed" | "failed";

export type AgUiUnitReference = {
  id: string;
  label: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  priceLabel?: string;
};

export type AgUiProjectReference = {
  id: string;
  title: string;
  location: string;
  image?: string;
  summary?: string;
};

export type AgUiPersonCardType = "broker" | "client";
export type AgUiPersonBadge = "verified" | "vip";

export type AgUiPersonRelation = {
  project: AgUiProjectReference | null;
  unit: AgUiUnitReference | null;
  stageLabel?: string;
  summary?: string;
};

export type AgUiDraftState = {
  actionId: AgUiActionDefinition["id"];
  title: string;
  description: string;
  fields: Record<string, string>;
  missingFields: string[];
  zone: AgUiActionDefinition["zone"];
  relation?: AgUiPersonRelation | null;
  state: AgUiExecutionState;
};

export type AgUiCardDefinition = {
  id: string;
  componentId: AgUiComponentId;
  props: Record<string, unknown>;
};

export type AgUiConversationTurn = {
  objective: string;
  targetZone: string;
  action: AgUiActionDefinition;
  draft?: AgUiDraftState;
  executionState?: AgUiExecutionState;
  cards: AgUiCardDefinition[];
  assistantText: string;
  followupQuestion?: string;
};

export type AgUiActionInvocation = {
  actionId: AgUiActionDefinition["id"];
  actionName: string;
  turn: AgUiConversationTurn;
  card: AgUiCardDefinition;
  payload?: unknown;
};

export type AgUiActionHandler = (invocation: AgUiActionInvocation) => void | Promise<void>;

export type AgUiActionHandlers = {
  onAction?: AgUiActionHandler;
  byActionId?: Partial<Record<AgUiActionDefinition["id"], AgUiActionHandler>>;
  byName?: Partial<Record<string, AgUiActionHandler>>;
  byActionAndName?: Partial<Record<string, AgUiActionHandler>>;
};

export type AgUiCardRenderContext = {
  turn: AgUiConversationTurn;
  card: AgUiCardDefinition;
  actionHandlers?: AgUiActionHandlers;
  dispatchAction: (actionName: string, payload?: unknown) => Promise<void>;
};

export type AgUiCardComponentProps<TProps extends Record<string, unknown> = Record<string, unknown>> = TProps & {
  agUiContext?: AgUiCardRenderContext;
};

export type AgUiRegisteredComponent = ComponentType<AgUiCardComponentProps>;

export type AgUiRendererOverrides = Partial<Record<AgUiComponentId, AgUiRegisteredComponent>>;
