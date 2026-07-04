"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/domains/auth/auth-session";
import type { TheoryFormValues, TheoryRecord } from "../theories.types";
import {
  createTheoryRequest,
  updateTheoryRequest,
  deleteTheoryRequest,
} from "../api/theories";

const THEORIES_KEY = "theories";

function getOrgId(session: ReturnType<typeof useAuthSession>): string | null {
  return session.workspace?.organizationId ?? null;
}

export function useCreateTheoryMutation() {
  const session = useAuthSession();
  const organizationId = getOrgId(session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TheoryFormValues) => {
      if (!organizationId) throw new Error("No organization");
      return createTheoryRequest(organizationId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [THEORIES_KEY] });
    },
  });
}

export function useUpdateTheoryMutation() {
  const session = useAuthSession();
  const organizationId = getOrgId(session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ theoryId, values }: { theoryId: string; values: TheoryFormValues }) => {
      if (!organizationId) throw new Error("No organization");
      return updateTheoryRequest(organizationId, theoryId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [THEORIES_KEY] });
    },
  });
}

export function useDeleteTheoryMutation() {
  const session = useAuthSession();
  const organizationId = getOrgId(session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theoryId: string) => {
      if (!organizationId) throw new Error("No organization");
      return deleteTheoryRequest(organizationId, theoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [THEORIES_KEY] });
    },
  });
}
