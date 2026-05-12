import { createApi } from "@convex-dev/better-auth";
import { createAuthOptions } from "../auth";
import schema from "./schema";

const createSchemaAuthOptions = (ctx: Parameters<typeof createAuthOptions>[0]) =>
  createAuthOptions(ctx, "schema");

// Adapter functions are the component's database surface for Better Auth internals.
export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createSchemaAuthOptions);
