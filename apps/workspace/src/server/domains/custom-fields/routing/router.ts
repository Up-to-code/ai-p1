import { Hono } from "hono";
import {
  handleListCustomFieldDefinitions,
  handleListCustomFieldDefinitionsForTable,
  handleListCustomFieldValues,
  handleListAllCustomFieldValues,
  handleCreateCustomFieldDefinition,
  handleUpdateCustomFieldDefinition,
  handleDeleteCustomFieldDefinition,
  handleReorderCustomFieldDefinitions,
  handleUpsertCustomFieldValue,
  handleDeleteCustomFieldValue,
} from "../handlers/custom-fields";

export const customFieldsSubRouter = new Hono();

// Field definitions
customFieldsSubRouter.get("/:organizationId/custom-fields/definitions", handleListCustomFieldDefinitions);
customFieldsSubRouter.get("/:organizationId/custom-fields/definitions/table/:recordType", handleListCustomFieldDefinitionsForTable);
customFieldsSubRouter.post("/:organizationId/custom-fields/definitions", handleCreateCustomFieldDefinition);
customFieldsSubRouter.patch("/:organizationId/custom-fields/definitions/:fieldId", handleUpdateCustomFieldDefinition);
customFieldsSubRouter.delete("/:organizationId/custom-fields/definitions/:fieldId", handleDeleteCustomFieldDefinition);
customFieldsSubRouter.post("/:organizationId/custom-fields/definitions/reorder", handleReorderCustomFieldDefinitions);

// Field values
customFieldsSubRouter.get("/:organizationId/custom-fields/values/:recordType/:recordId", handleListCustomFieldValues);
customFieldsSubRouter.get("/:organizationId/custom-fields/values/:recordType", handleListAllCustomFieldValues);
customFieldsSubRouter.post("/:organizationId/custom-fields/values", handleUpsertCustomFieldValue);
customFieldsSubRouter.delete("/:organizationId/custom-fields/values/:valueId", handleDeleteCustomFieldValue);
