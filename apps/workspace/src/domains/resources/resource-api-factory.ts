import { workspaceMutation } from "./workspace-resource-request";

export type ResourceApiConfig<TRecord, TCreate, TUpdate> = {
  resourcePath: string;
  resourceKey: string;
  toPayload: (values: TCreate | TUpdate) => unknown;
};

export type ResourceApi<TRecord, TCreate, TUpdate> = {
  create(organizationId: string, values: TCreate): Promise<Record<string, TRecord>>;
  update(organizationId: string, resourceId: string, values: TUpdate): Promise<Record<string, TRecord>>;
  remove(organizationId: string, resourceId: string): Promise<void>;
};

export function createResourceApi<TRecord, TCreate, TUpdate>(
  config: ResourceApiConfig<TRecord, TCreate, TUpdate>,
): ResourceApi<TRecord, TCreate, TUpdate> {
  const { resourcePath, resourceKey, toPayload } = config;
  const cap = resourceKey.charAt(0).toUpperCase() + resourceKey.slice(1);

  function create(organizationId: string, values: TCreate) {
    return workspaceMutation<Record<string, TRecord>>(organizationId, resourcePath, {
      method: "POST",
      body: toPayload(values),
      fallbackMessage: `${cap} request failed.`,
    });
  }

  function update(organizationId: string, resourceId: string, values: TUpdate) {
    return workspaceMutation<Record<string, TRecord>>(organizationId, [resourcePath, resourceId], {
      method: "PATCH",
      body: toPayload(values),
      fallbackMessage: `${cap} request failed.`,
    });
  }

  function remove(organizationId: string, resourceId: string): Promise<void> {
    return workspaceMutation(organizationId, [resourcePath, resourceId], {
      method: "DELETE",
      fallbackMessage: `${cap} request failed.`,
    }) as Promise<void>;
  }

  return { create, update, remove };
}
