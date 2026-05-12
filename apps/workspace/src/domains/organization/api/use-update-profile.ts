"use client";

import { useMutation } from "@tanstack/react-query";
import { updateOrganizationProfileRequest } from "./update-profile";
import type { UpdateOrganizationProfileValues } from "../validation/organization.schema";

export function useUpdateOrganizationProfileMutation(organizationId: string) {
  return useMutation({
    mutationFn: (input: UpdateOrganizationProfileValues) =>
      updateOrganizationProfileRequest(organizationId, input),
  });
}
