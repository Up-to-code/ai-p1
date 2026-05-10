import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { createProperty, deleteProperty, updateProperty } from "../services/properties";
import { propertyPayloadSchema } from "../validation/property.schema";

function handleError(c: Context, error: unknown) {
  const message = error instanceof Error ? error.message : "Property action failed.";
  return c.json({ error: message }, 500 as ContentfulStatusCode);
}

export async function handleCreateProperty(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);
  const parsed = await validateJsonBody(c, propertyPayloadSchema, "Invalid property payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const property = await createProperty(organizationId, parsed.data);
    return c.json({ property });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleUpdateProperty(c: Context) {
  const organizationId = c.req.param("organizationId");
  const propertyId = c.req.param("propertyId");
  if (!organizationId || !propertyId) return c.json({ error: "Organization and property ids are required." }, 400);
  const parsed = await validateJsonBody(c, propertyPayloadSchema, "Invalid property payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const property = await updateProperty(organizationId, propertyId, parsed.data);
    return c.json({ property });
  } catch (error) {
    return handleError(c, error);
  }
}

export async function handleDeleteProperty(c: Context) {
  const organizationId = c.req.param("organizationId");
  const propertyId = c.req.param("propertyId");
  if (!organizationId || !propertyId) return c.json({ error: "Organization and property ids are required." }, 400);

  try {
    const result = await deleteProperty(organizationId, propertyId);
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}
