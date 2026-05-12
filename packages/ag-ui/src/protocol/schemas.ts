import { z } from "zod";

export const agUiComponentIdSchema = z.enum([
  "project_create_draft",
  "offer_publish_draft",
  "offer_send_draft",
  "thread_update",
  "project_unit_selector",
  "person_relation",
  "approval_footer",
  "execution_result",
  "field_request_list",
  "latest_update",
  "market_insight",
  "area_heat",
  "constraint_summary",
  "missing_data_prompt",
  "data_list",
  "filter_summary",
  "target_summary",
]);

export const agUiActionDefinitionSchema = z.object({
  id: z.enum([
    "create_project",
    "list_clients",
    "list_projects",
    "search_projects",
    "list_offers",
    "search_offers",
    "delete_project_confirmation",
    "publish_offer",
    "send_offer",
    "latest_update",
    "search_market",
    "search_project",
    "search_broker_demand",
  ]),
  title: z.string().min(1),
  zone: z.enum(["projects", "offers", "crm", "market"]),
  fields: z.array(z.string()),
});

export const agUiExecutionStateSchema = z.enum([
  "draft",
  "collecting",
  "ready",
  "executing",
  "completed",
  "failed",
]);

export const agUiCardDefinitionSchema = z.object({
  id: z.string().min(1),
  componentId: agUiComponentIdSchema,
  props: z.record(z.unknown()),
});

export const agUiDraftStateSchema = z.object({
  actionId: agUiActionDefinitionSchema.shape.id,
  title: z.string().min(1),
  description: z.string(),
  fields: z.record(z.string()),
  missingFields: z.array(z.string()),
  zone: agUiActionDefinitionSchema.shape.zone,
  relation: z
    .object({
      project: z
        .object({
          id: z.string(),
          title: z.string(),
          location: z.string(),
          image: z.string().optional(),
          summary: z.string().optional(),
        })
        .nullable(),
      unit: z
        .object({
          id: z.string(),
          label: z.string(),
          bedrooms: z.number().optional(),
          bathrooms: z.number().optional(),
          area: z.string().optional(),
          priceLabel: z.string().optional(),
        })
        .nullable(),
      stageLabel: z.string().optional(),
      summary: z.string().optional(),
    })
    .nullable()
    .optional(),
  state: agUiExecutionStateSchema,
});

export const agUiConversationTurnSchema = z.object({
  objective: z.string().min(1),
  targetZone: z.string().min(1),
  action: agUiActionDefinitionSchema,
  draft: agUiDraftStateSchema.optional(),
  executionState: agUiExecutionStateSchema.optional(),
  cards: z.array(agUiCardDefinitionSchema),
  assistantText: z.string(),
  followupQuestion: z.string().optional(),
});
