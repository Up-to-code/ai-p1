import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "../_generated/dataModel";
import { createSchemaAuth } from "../auth";

// Static export used only by the Better Auth CLI when regenerating component schema.
export const auth = createSchemaAuth({} as GenericCtx<DataModel>);
