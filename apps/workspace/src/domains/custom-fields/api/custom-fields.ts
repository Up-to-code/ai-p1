"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/domains/auth";
import { workspaceFetch, organizationApiPath } from "@/domains/resources/workspace-resource-request";
import type { CustomFieldDefinitionInput, CustomFieldValueInput } from "@/server/domains/custom-fields/validation/custom-field.schema";

export type CustomFieldDefinition = {
  id: string;
  key: string;
  label: string;
  description?: string;
  type: CustomFieldDefinitionInput["type"];
  required: boolean;
  options?: Array<{ id: string; label: string; color?: string; order: number; archivedAt?: number }>;
  appliesTo: string[];
  defaultValue?: unknown;
  display?: {
    formSection?: string;
    tableVisible: boolean;
    boardVisible: boolean;
    detailVisible: boolean;
    requiredOnCreate: boolean;
  };
  order: number;
};

export type CustomFieldValue = {
  id: string;
  fieldDefinitionId: string;
  fieldKey: string;
  textValue?: string;
  numberValue?: number;
  currencyValue?: number;
  booleanValue?: boolean;
  dateValue?: string;
  dateTimeValue?: string;
  selectValue?: string;
  multiSelectValue?: string[];
  userValue?: string;
  urlValue?: string;
};

function useOrgId() {
  const session = useAuthSession();
  return session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
}

function customFieldsPath(orgId: string, ...segments: string[]) {
  return organizationApiPath(orgId, "custom-fields", ...segments);
}

export function useCustomFieldDefinitionsQuery(recordType?: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["custom-field-definitions", orgId, recordType],
    queryFn: () => {
      const qs = recordType ? `?recordType=${recordType}` : "";
      return workspaceFetch<{ definitions: CustomFieldDefinition[] }>(
        orgId!,
        `custom-fields/definitions${qs}`,
        { method: "GET", fallbackMessage: "Failed to load custom fields" },
      );
    },
    enabled: Boolean(orgId),
  });
}

export function useCustomFieldDefinitionsForTableQuery(recordType: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["custom-field-definitions-table", orgId, recordType],
    queryFn: () =>
      workspaceFetch<{ definitions: CustomFieldDefinition[] }>(
        orgId!,
        `custom-fields/definitions/table/${recordType}`,
        { method: "GET", fallbackMessage: "Failed to load custom fields" },
      ),
    enabled: Boolean(orgId),
  });
}

export function useCustomFieldValuesQuery(recordType: string, recordId: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["custom-field-values", orgId, recordType, recordId],
    queryFn: () =>
      workspaceFetch<{ values: CustomFieldValue[] }>(
        orgId!,
        `custom-fields/values/${recordType}/${recordId}`,
        { method: "GET", fallbackMessage: "Failed to load custom field values" },
      ),
    enabled: Boolean(orgId) && Boolean(recordId),
  });
}

export function useAllCustomFieldValuesQuery(recordType: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["custom-field-values-all", orgId, recordType],
    queryFn: () =>
      workspaceFetch<{ values: CustomFieldValue[] }>(
        orgId!,
        `custom-fields/values/${recordType}`,
        { method: "GET", fallbackMessage: "Failed to load custom field values" },
      ),
    enabled: Boolean(orgId),
  });
}

export function useCreateCustomFieldDefinitionMutation() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomFieldDefinitionInput) =>
      workspaceFetch(orgId!, "custom-fields/definitions", {
        method: "POST",
        body: input,
        fallbackMessage: "Failed to create custom field",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions-table"] });
    },
  });
}

export function useUpdateCustomFieldDefinitionMutation() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, input }: { fieldId: string; input: Partial<CustomFieldDefinitionInput> }) =>
      workspaceFetch(orgId!, `custom-fields/definitions/${fieldId}`, {
        method: "PATCH",
        body: input,
        fallbackMessage: "Failed to update custom field",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions-table"] });
    },
  });
}

export function useDeleteCustomFieldDefinitionMutation() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fieldId: string) =>
      workspaceFetch(orgId!, `custom-fields/definitions/${fieldId}`, {
        method: "DELETE",
        fallbackMessage: "Failed to delete custom field",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions-table"] });
      queryClient.invalidateQueries({ queryKey: ["custom-field-values"] });
    },
  });
}

export function useUpsertCustomFieldValueMutation() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomFieldValueInput) =>
      workspaceFetch(orgId!, "custom-fields/values", {
        method: "POST",
        body: input,
        fallbackMessage: "Failed to save custom field value",
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-values"] });
      queryClient.invalidateQueries({ queryKey: ["custom-field-values-all"] });
    },
  });
}

export function useDeleteCustomFieldValueMutation() {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valueId: string) =>
      workspaceFetch(orgId!, `custom-fields/values/${valueId}`, {
        method: "DELETE",
        fallbackMessage: "Failed to delete custom field value",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-values"] });
      queryClient.invalidateQueries({ queryKey: ["custom-field-values-all"] });
    },
  });
}
