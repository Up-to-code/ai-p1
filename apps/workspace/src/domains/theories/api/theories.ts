"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { TheoryFormValues, TheoryRecord } from "../theories.types";

function theoryPayloadFromForm(values: TheoryFormValues) {
  return {
    title: values.title,
    content: values.content,
    isPrivate: values.isPrivate,
    source: values.source,
    category: values.category || undefined,
    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

export function useTheoriesQuery(organizationId?: string) {
  const theories = useQuery(
    api.theories.read.list,
    organizationId ? { organizationId } : "skip",
  );
  return {
    data: theories?.filter((t) => !t.deletedAt),
    isLoading: theories === undefined,
  };
}

export function usePrivateTheoriesQuery(organizationId?: string, userId?: string) {
  const theories = useQuery(
    api.theories.read.listPrivate,
    organizationId && userId ? { organizationId, userId } : "skip",
  );
  return {
    data: theories?.filter((t) => !t.deletedAt),
    isLoading: theories === undefined,
  };
}

export function useAllTheoriesQuery(organizationId?: string) {
  const theories = useQuery(
    api.theories.read.listAll,
    organizationId ? { organizationId } : "skip",
  );
  return {
    data: theories?.filter((t) => !t.deletedAt),
    isLoading: theories === undefined,
  };
}

export function useTheoryQuery(organizationId?: string, theoryId?: string) {
  const theory = useQuery(
    api.theories.read.get,
    organizationId && theoryId ? { organizationId, theoryId: theoryId as any } : "skip",
  );
  return { data: theory ?? null, isLoading: theory === undefined };
}

export async function createTheoryRequest(organizationId: string, values: TheoryFormValues) {
  return workspaceMutation<{ theory: TheoryRecord }>(organizationId, "theories", {
    method: "POST",
    body: theoryPayloadFromForm(values),
    fallbackMessage: "Theory request failed.",
  });
}

export async function updateTheoryRequest(organizationId: string, theoryId: string, values: TheoryFormValues) {
  return workspaceMutation<{ theory: TheoryRecord }>(organizationId, `theories/${theoryId}`, {
    method: "PATCH",
    body: theoryPayloadFromForm(values),
    fallbackMessage: "Theory request failed.",
  });
}

export async function deleteTheoryRequest(organizationId: string, theoryId: string) {
  return workspaceMutation(organizationId, `theories/${theoryId}`, {
    method: "DELETE",
    body: undefined,
    fallbackMessage: "Theory request failed.",
  });
}
