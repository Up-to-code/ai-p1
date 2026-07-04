import { z } from "zod";

const databaseFields = [
  "_id",
  "_creationTime",
  "id",
  "organizationId",
  "createdByUserId",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "isDeleted",
  "syncState",
  "added",
  "lastContact",
  "nextActionDate",
  "appointmentTime",
];

export function stripDatabaseFields(value: Record<string, unknown>): Record<string, unknown> {
  const clean = { ...value };
  for (const field of databaseFields) {
    delete clean[field];
  }
  return clean;
}

export async function updateEntity<T extends Record<string, unknown>>(params: {
  organizationId: string;
  id: string;
  idKey: string;
  label: string;
  fetchExisting: () => Promise<T | null>;
  updateFn: (organizationId: string, id: string, data: unknown) => Promise<unknown>;
  input: Record<string, unknown>;
  schema: z.ZodObject<any>;
  patchOverrides?: Record<string, unknown>;
}): Promise<unknown> {
  const existing = await params.fetchExisting();
  if (!existing) throw new Error(`${params.label} was not found.`);

  const patch = { ...params.input };
  delete patch[params.idKey];

  const merged = {
    ...stripDatabaseFields(existing as Record<string, unknown>),
    ...stripDatabaseFields(patch),
    ...params.patchOverrides,
  };

  return params.updateFn(params.organizationId, params.id, merged);
}
