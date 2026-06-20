import type { FunctionReference } from "convex/server";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";

type MutationRef = FunctionReference<"mutation", "public">;

interface CrudServiceConfig<TInput> {
  api: {
    create: MutationRef;
    update: MutationRef;
    delete: MutationRef;
  };
  idParamName: string;
  toConvexInput?: (input: TInput) => unknown;
}

interface CrudService<TInput> {
  create(organizationId: string, input: TInput): Promise<unknown>;
  update(organizationId: string, entityId: string, input: TInput): Promise<unknown>;
  remove(organizationId: string, entityId: string): Promise<unknown>;
}

export function createCrudService<TInput>(config: CrudServiceConfig<TInput>): CrudService<TInput> {
  const { api, idParamName, toConvexInput } = config;
  const transform = toConvexInput ?? ((input: TInput) => input);

  return {
    create(organizationId, input) {
      return fetchAuthMutation(api.create, {
        organizationId,
        input: transform(input),
      });
    },
    update(organizationId, entityId, input) {
      return fetchAuthMutation(api.update, {
        organizationId,
        [idParamName]: entityId as never,
        input: transform(input),
      });
    },
    remove(organizationId, entityId) {
      return fetchAuthMutation(api.delete, {
        organizationId,
        [idParamName]: entityId as never,
      });
    },
  };
}
