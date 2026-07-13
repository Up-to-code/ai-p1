import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "@/server/auth/auth-request";
import type {
  CustomFieldDefinitionInput,
  CustomFieldRecordTypeInput,
  CustomFieldValueInput,
} from "../validation/custom-field.schema";

export async function listCustomFieldDefinitions(
  organizationId: string,
  recordType?: CustomFieldRecordTypeInput,
) {
  return fetchAuthQuery(api.customFields.read.listByOrganization, {
    organizationId,
    recordType,
  });
}

export async function listCustomFieldDefinitionsForTable(
  organizationId: string,
  recordType: CustomFieldRecordTypeInput,
) {
  return fetchAuthQuery(api.customFields.read.listByOrganizationForTable, {
    organizationId,
    recordType,
  });
}

export async function listCustomFieldValues(
  organizationId: string,
  recordType: CustomFieldRecordTypeInput,
  recordId: string,
) {
  return fetchAuthQuery(api.customFields.values_read.listByRecord, {
    organizationId,
    recordType,
    recordId,
  });
}

export async function listAllCustomFieldValues(
  organizationId: string,
  recordType: CustomFieldRecordTypeInput,
) {
  return fetchAuthQuery(api.customFields.values_read.listByOrganization, {
    organizationId,
    recordType,
  });
}

export async function createCustomFieldDefinition(organizationId: string, input: CustomFieldDefinitionInput) {
  return fetchAuthMutation(api.customFields.write.createFromHono, {
    organizationId,
    ...input,
  });
}

export async function updateCustomFieldDefinition(
  organizationId: string,
  fieldId: string,
  input: Partial<Omit<CustomFieldDefinitionInput, "key" | "type" | "appliesTo">> & {
    appliesTo?: CustomFieldDefinitionInput["appliesTo"];
  },
) {
  return fetchAuthMutation(api.customFields.write.updateFromHono, {
    organizationId,
    fieldId: fieldId as any,
    ...input,
  });
}

export async function deleteCustomFieldDefinition(organizationId: string, fieldId: string) {
  return fetchAuthMutation(api.customFields.write.deleteFromHono, {
    organizationId,
    fieldId: fieldId as any,
  });
}

export async function reorderCustomFieldDefinitions(
  organizationId: string,
  fieldOrders: Array<{ fieldId: string; order: number }>,
) {
  return fetchAuthMutation(api.customFields.write.reorderFromHono, {
    organizationId,
    fieldOrders: fieldOrders.map((fo) => ({ fieldId: fo.fieldId as any, order: fo.order })),
  });
}

export async function upsertCustomFieldValue(organizationId: string, input: CustomFieldValueInput) {
  return fetchAuthMutation(api.customFields.values_write.upsertFromHono, {
    organizationId,
    fieldDefinitionId: input.fieldDefinitionId as any,
    fieldKey: input.fieldKey,
    recordType: input.recordType,
    recordId: input.recordId,
    type: input.type,
    textValue: input.textValue,
    numberValue: input.numberValue,
    currencyValue: input.currencyValue,
    booleanValue: input.booleanValue,
    dateValue: input.dateValue,
    dateTimeValue: input.dateTimeValue,
    selectValue: input.selectValue,
    multiSelectValue: input.multiSelectValue,
    userValue: input.userValue,
    urlValue: input.urlValue,
  });
}

export async function deleteCustomFieldValue(organizationId: string, valueId: string) {
  return fetchAuthMutation(api.customFields.values_write.deleteFromHono, {
    organizationId,
    valueId: valueId as any,
  });
}
