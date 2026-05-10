import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/better-auth/server";
import type { PropertyPayload } from "../validation/property.schema";

export async function createProperty(organizationId: string, input: PropertyPayload) {
  return fetchAuthMutation(api.properties.write.createFromHono, {
    organizationId,
    input: { ...input, projectId: input.projectId as never },
  });
}

export async function updateProperty(organizationId: string, propertyId: string, input: PropertyPayload) {
  return fetchAuthMutation(api.properties.write.updateFromHono, {
    organizationId,
    propertyId: propertyId as never,
    input: { ...input, projectId: input.projectId as never },
  });
}

export async function deleteProperty(organizationId: string, propertyId: string) {
  return fetchAuthMutation(api.properties.write.deleteFromHono, {
    organizationId,
    propertyId: propertyId as never,
  });
}
