import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import {
  listCustomFieldDefinitions,
  listCustomFieldDefinitionsForTable,
  listCustomFieldValues,
  listAllCustomFieldValues,
  createCustomFieldDefinition,
  updateCustomFieldDefinition,
  deleteCustomFieldDefinition,
  reorderCustomFieldDefinitions,
  upsertCustomFieldValue,
  deleteCustomFieldValue,
} from "../services/custom-fields";
import { customFieldDefinitionSchema, customFieldValueSchema } from "../validation/custom-field.schema";

export async function handleListCustomFieldDefinitions(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const recordType = c.req.query("recordType");
  const definitions = await listCustomFieldDefinitions(org.organizationId, recordType);
  return c.json({ definitions });
}

export async function handleListCustomFieldDefinitionsForTable(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const recordType = c.req.param("recordType")!;
  const definitions = await listCustomFieldDefinitionsForTable(org.organizationId, recordType);
  return c.json({ definitions });
}

export async function handleListCustomFieldValues(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const recordType = c.req.param("recordType")!;
  const recordId = c.req.param("recordId")!;
  const values = await listCustomFieldValues(org.organizationId, recordType, recordId);
  return c.json({ values });
}

export async function handleListAllCustomFieldValues(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const recordType = c.req.param("recordType")!;
  const values = await listAllCustomFieldValues(org.organizationId, recordType);
  return c.json({ values });
}

export async function handleCreateCustomFieldDefinition(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const body = await c.req.json();
  const parsed = customFieldDefinitionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const result = await createCustomFieldDefinition(org.organizationId, parsed.data);
  return c.json(result);
}

export async function handleUpdateCustomFieldDefinition(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const fieldId = c.req.param("fieldId")!;
  const body = await c.req.json();
  const result = await updateCustomFieldDefinition(org.organizationId, fieldId, body);
  return c.json(result);
}

export async function handleDeleteCustomFieldDefinition(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const fieldId = c.req.param("fieldId")!;
  const result = await deleteCustomFieldDefinition(org.organizationId, fieldId);
  return c.json(result);
}

export async function handleReorderCustomFieldDefinitions(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const body = await c.req.json();
  const result = await reorderCustomFieldDefinitions(org.organizationId, body.fieldOrders);
  return c.json(result);
}

export async function handleUpsertCustomFieldValue(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const body = await c.req.json();
  const parsed = customFieldValueSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }
  const result = await upsertCustomFieldValue(org.organizationId, parsed.data);
  return c.json(result);
}

export async function handleDeleteCustomFieldValue(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const valueId = c.req.param("valueId")!;
  const result = await deleteCustomFieldValue(org.organizationId, valueId);
  return c.json(result);
}
